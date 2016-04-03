/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var bcrypt = require('bcrypt');

module.exports = {
	'new': function(req, res) {
		res.view();
	}, 

	'create': function(req, res, next) {
		if (!req.param('email') || !req.param('password')) {
			var usernamePasswordRequiredError = [{name: 'usernamePasswordRequired', message: 'You must enter both a username and password.'}];
			req.session.flash = {
				err: usernamePasswordRequiredError
			};

			return res.redirect('/session/new');
		}

		User.findOneByEmail(req.param('email'), function(err, user) {
			if (err) {
				return next(err);
			}

			if (!user) {
				var userNotFoundError = [{name: 'userNotFound', message: 'User not found.'}];
				req.session.flash = {
					err: userNotFoundError
				}

				return res.redirect('/session/new');
			}

			bcrypt.compare(req.param('password'), user.encryptedPassword, function(err, valid) {
				if (err) {
					return next(err);
				}

				if (!valid) {
					var usernamePasswordInvalidError = [{name: 'usernamePasswordInvalid', message: 'Invalid username and password combination.'}];
					req.session.flash = {
						err: usernamePasswordInvalidError
					}

					return res.redirect('/session/new');
				}

				// log user in
				req.session.authenticated = true;
				req.session.user = user;

				// redirect to show user page
				return res.redirect('/user/show/' + user.id);
			});
		});
	},

	'destroy': function(req, res, next) {
		req.session.destroy();
		res.redirect('/session/new');
	}
};

