/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function(req, res, next) {
	if (req.session.user) {
		return ok();
	} else {
		res.send(403);
	}

	/*
	if (req.session.authenticated) {
		return next();
	} else {
		var requiredLoginError = [{name: 'requiredLogin', message: 'You must be logged in.'}];
		req.session.flash = {
			err: requiredLoginError
		}

		return res.redirect('/session/new');
	}
	*/
};
