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
		console.log(req);
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
	}
};

