module.exports = function(req, res, next) {
	if (!req.session.authenticated) {
		var loginRequiredError = [{name: 'loginRequired', message: 'You must be logged in.'}];
		req.session.flash = {
			err: loginRequiredError
		}

		return res.redirect('/session/new');
	}

	if(req.session.user && req.session.user.admin) {
		return next();
	} else {
		var requiredAdminError = [{name: 'requiredAdmin', message: 'You must be an admin.'}];
		req.session.flash = {
			err: requiredAdminError
		}
		return res.redirect('/session/new');
	}
}