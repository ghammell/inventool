/**
 * CompanyController
 *
 * @description :: Server-side logic for managing companies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	'dashboard': function(req, res, next) {
		Company.findOne(req.param('id'), function(err, company) {
			if (err) {
				return next(err);
			}

			if (!company) {
				return next('Company doesn\'t exist.');
			}

			return res.view({
				company: company
			})
		});
	}
};

