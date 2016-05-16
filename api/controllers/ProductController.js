/**
 * ProductController
 *
 * @description :: Server-side logic for managing products
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	'new': function(req,res,next) {
		return res.view();
	},
	'create': function(req, res, next) {
		var productObj = {
			name: req.param('name'),
			inventoryOnHand: req.param('inventoryOnHand'),
			unitPrice: req.param('unitPrice'),
			company: req.session.user.company,
			barCodeNumber: req.param('barCodeNumber'),
			description: req.param('description')
		}

		Product.create(productObj, function(err, product) {
			if (err) {
				req.session.flash = {
					err: err
				}

				return res.redirect('/product/new');
			}

			return res.redirect('/product/index');
		});
	},
	'edit': function(req, res, next) {
		Product.findOne(req.param('id'), function(err, product) {
			if (err) {
				return next(err);
			}

			if (!product) {
				return next('Product not found.');
			}

			return res.view({
				product: product
			});
		});
	},
	'update': function(req, res, next) {
		var productObj = {
			name: req.param('name'),
			inventoryOnHand: req.param('inventoryOnHand'),
			unitPrice: req.param('unitPrice'),
			barCodeNumber: req.param('barCodeNumber'),
			description: req.param('description')
		}

		Product.update(req.param('id'), productObj, function(err, product) {
			if (err) {
				req.session.flash = {
					err: err
				}

				return res.redirect('/product/edit/' + req.param('id'));
			}

			return res.redirect('/product/index/');
		});
	},
	'index': function(req, res, next) {
		Product.find({company: req.session.user.company}, function(err, products) {
			if (err) {
				return next(err);
			}

			res.view({
				products: products
			});
		});
	},
	'show': function(req, res, next) {
		Product.findOne(req.param('id'), function(err, product) {
			if (err) {
				return next(err);
			}

			return res.view({
				product: product
			});
		});
	},
	'destroy': function(req, res, next) {
		Product.destroy(req.param('id'), function(err) {
			if (err) {
				return next(err);
			}

			res.redirect('/product/index');
		});
	},
	'sales': function(req, res, next) {
		console.log(req.param('id'));

		Product.findOne(req.param('id'), function(err, product) {
			if (err) {
				return next(err);
			}

			console.log(product);

			SaleLineItem.find({product: product.id}).populate('sale').exec(function(err, items) {
				if (err) {
					return next(err);
				}

				console.log(product);
				console.log(items);

				return res.view({product: product, items: items});
			});
		});
	}
};

