/**
 * SaleController
 *
 * @description :: Server-side logic for managing sales
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	'new': function(req, res, next) {
		return res.view();
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

			console.log('SALE: ');
			console.log(sale);

			SaleLineItem.create(itemsToCreate, function(err, items) {
				console.log('ITEMS:');
				console.log(items);
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
		console.log('broadcasting!');

		var roomName = req.session.user.id + '_' + req.param('roomName');

		sails.sockets.broadcast(roomName, {
			message: 'saleUpdate', 
			lineItem: JSON.parse(req.param('lineItem')),
			isFromMobile: req.param('isMobile')
		});
	}
};

