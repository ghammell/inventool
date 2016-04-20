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
			company: req.session.user.company
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
			inventoryOnHand: req.param('inventoryOnHand')
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
	'destroy': function(req, res, next) {
		Product.destroy(req.param('id'), function(err) {
			if (err) {
				return next(err);
			}

			res.redirect('/product/index');
		});
	}
};

