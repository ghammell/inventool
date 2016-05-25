/**
 * SaleController
 *
 * @description :: Server-side logic for managing sales
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	'new': function(req, res, next) {
		if (req.param('product')) {
			Product.findOne(req.param('product'), function(err, product) {
				// NEED TO FIGURE OUT HOW TO GET THIS TO WORK
				// CURRENTLY THE PRODUCT DATA CAN'T BE ACCESSED VIA JAVASCRIPT ON THE FRONT END
				return res.view({
					product: product
				})
			});
		} else {
			return res.view();	
		}		
	},
	'create': function(req, res, next) {
		var itemsFromServer = JSON.parse(req.param('lineItems'));

		// list of sale line items to create
		var itemsToCreate = [];

		// total of sale
		var saleTotal = 0;

		// generate items and add to list;  increment sales total
		itemsFromServer.forEach(function(serverItem) {
			var item = {
				totalPrice: serverItem.totalPrice,
				quantity: serverItem.quantity,
				product: serverItem.product.id
			};

			// add item to list to create
			itemsToCreate.push(item);

			// increment sale total
			saleTotal += item.totalPrice;
		});		


		// create sale and add line items to it
		var saleObj = {
			company: req.session.user.company,
			totalPrice: saleTotal
		}

		Sale.create(saleObj, function(err, sale) {
			// set the sale id on each item
			itemsToCreate.forEach(function(item){
				item.sale = sale.id
			});

			SaleLineItem.create(itemsToCreate, function(err, items) {
				// NEED TO HANDLE ERRORS AND ONLY REDIRECT IF NO ERRORS
				res.redirect('/sale/show/' + sale.id);
			});
		});
	},
	'show': function(req, res, next) {
		Sale.findOne(req.param('id'), function(err, sale) {
			if (err) {
				return next(err);
			}

			SaleLineItem.find({sale: sale.id}).populate('product').exec(function(err, items) {
				if (err) {
					return next(err);
				}

				return res.view({sale: sale, items: items});
			});
		});
	},
	'productSearch': function(req, res, next) {
		var data = {};
		Product.find({
			name: {
				'like': '%' + req.param('productSearch') + '%'
			}
		}, function(err, products) {
			if (err) {
				console.log(err);
				return next(err);
			}

			data.products = products;

			return res.json(200, data);			
		});
	},
	'productInfo': function(req, res, next) {
		var data = {};
		Product.findOne({
			name: req.param('product')
		}, function(err, product) {
			if (err) {
				console.log(err);
				return next(err);
			}

			data.product = product;

			return res.json(200, data);
		});
	},
	'subscribe': function(req, res, next) {
		// this method subscribes all instances of the same user to a 'sale' room
		// to synchronize mobile scanning and desktop sales transactions

		if (!req.isSocket) {
			return res.badRequest('Not authorized.');
		}

		var roomName = req.session.user.id + '_' + req.param('roomName');
		sails.sockets.join(req, roomName, function(err) {
			if (err) {
				return res.serverError(err);
			}

			sails.sockets.broadcast(roomName, {message: 'newSubscriber'});

			return res.json({
				message: 'Subscribed to ' + roomName
			})
		});
	},
	'broadcastSaleUpdate': function(req, res, next) {
		// need to deprecate - using the 'productScan' functionality now
		var roomName = req.session.user.id + '_' + req.param('roomName');

		sails.sockets.broadcast(roomName, {
			message: 'saleUpdate', 
			lineItem: JSON.parse(req.param('lineItem')),
			isFromMobile: req.param('isMobile')
		});
	},
	'productScan': function(req, res, next) {
		// find product via 'code' param
		Product.findOne({barCodeNumber: req.param('code')}, function(err, product) {
			if (err) {
				return next(err);
			}

			// broadcast scanned product data
			var roomName = req.session.user.id + '_' + req.param('roomName');
			sails.sockets.broadcast(roomName, {
				message: 'mobileScan', 
				product: product
			});			

			// redirect back to barcode scanner to keep scanning additional products
	        var scanURL = encodeURIComponent('https://inventool.herokuapp.com/sale/productScan?code={CODE}&roomName=newSale');			
			res.redirect('http://zxing.appspot.com/scan?ret=' + scanURL + '&SCAN_FORMATS=UPC_A,EAN_13');
		});
	}
};

