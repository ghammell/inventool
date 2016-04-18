/**
 * PurchaseController
 *
 * @description :: Server-side logic for managing purchases
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	'new': function(req, res, next) {
		Product.findOne(req.param('product'), function(err, product) {
			if (err) {
				return next();
			}

			return res.view({
				product: product
			});			
		});
	},
	'create': function(req, res, next) {
		var purchaseObj = {
			company: req.session.user.company,
			quantity: req.param('quantity'),
			product: req.param('product')
		}

		Purchase.create(purchaseObj, function(purchaseError, purchase) {
			if (purchaseError) {
				req.session.flash = {
					err: purchaseError
				}			

				return res.redirect('/purchase/new?product=' + req.param('product'));
			}

			// retrieve product
			Product.findOne(req.param('product'), function(productError, product) {
				if (productError) {
					req.session.flash = {
						err: productError
					}

					return res.redirect('/purchase/new?product=' + req.param('product'));					
				}

				// update inventory on related product
				product.inventoryOnHand += parseInt(req.param('quantity'));
				product.save(function(saveError, productSave) {
					if (saveError) {
						req.session.flash = {
							err: saveError
						}

						return res.redirect('/purchase/new?product=' + req.param('product'));
					}

					return res.redirect('/product/index');
				});
			});
		});
	},
	index: function(req, res, next) {
		if (req.param('product') != null) {
			// if product id is passed in, return just the purchases for that product
			// and the product itself
			Product.findOne(req.param('product'), function(err, product) {
				if (err) {
					return next(err);
				}

				Purchase.find({where: {product: req.param('product')}, sort: 'createdAt DESC'}, function(err, purchases) {
					if (err) {
						return next(err);
					}

					if (!purchases) {
						return next('No purchases found.');
					}

					return res.view({
						product: product,
						purchases: purchases
					});
				});			
			});
		} else {
			// if product id is not passed in, just return all purchases for the company
			Purchase.find({where: {company: req.session.user.company}, sort: 'createdAt DESC'}).populate('product').exec(function(err, purchases) {
				if (err) {
					return next(err);
				}

				if (!purchases) {
					return next('No purchases found.');
				}

				return res.view({
					product: null,
					purchases: purchases
				});
			});
		}
	}
};

