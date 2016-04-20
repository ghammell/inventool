/**
 * CustomerController
 *
 * @description :: Server-side logic for managing customers
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	'new': function(req, res, next) {
		return res.view();
	},
	'create': function(req, res, next) {
		console.log('IN THE CREATE METHOD');
		var customerObj = {
			firstName: req.param('firstName'),
			lastName: req.param('lastName'),
			email: req.param('email'),
			company: req.session.user.company
		}

		Customer.create(customerObj, function(err, customer) {
			console.log('CREATING CUSTOMER');
			if (err) {
				req.session.flash = {
					err: err
				}

				return res.redirect('/customer/new');
			}

			return res.redirect('/customer/index');
		});
	},
	'update': function(req, res, next) {

	},
	'destroy': function(req, res, next) {

	},
	'index': function(req, res, next) {
		Customer.find({where: {company: req.session.user.company}, sort: 'createdAt DESC'}, function(err, customers) {
			if (err) {
				return next(err);
			}

			if (!customers) {
				return next('No customers were found.');
			}

			return res.view({
				customers: customers
			});
		});
	}
};

