module.exports = function(req, res, next) {
	if (!req.session.authenticated) {
		var loginRequiredError = [{name: 'loginRequired', message: 'You must be logged in.'}];
		req.session.flash = {
			err: loginRequiredError
		}

		return res.redirect('/session/new');
	}

	var sessionUserMatchesId = req.session.user.id == req.param('id');
	var isAdmin = req.session.user.admin;

	if (!(sessionUserMatchesId || isAdmin)) {
		var noRightsError = [{name: 'noRights', message: 'You do not have the priviliges required to view this page.'}];
		req.session.flash = {
			err: noRightsError
		}

		return res.redirect('/session/new');
	}

	next();
}