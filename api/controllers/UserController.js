/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	'new': function(req, res) {
		res.view({
			source: req.param('source')
		});
	},

	'create': function(req, res, next) {
		// if companyName is passed in, that should mean that it is a new sign up, so create company
		if (req.param('companyName')) {
			Company.create({name: req.param('companyName')}, function companyCreated(err, company) {
				if (err) {
					req.session.flash = {
						err: err
					}
				}

				createUser(req, res, company, 'signup');
			});
		} else {
			// otherwise find the existing company
			Company.findOne(req.session.user.company, function(err, company) {
				if (err) {
					req.session.flash = {
						err: err
					}
				}

				createUser(req, res, company, 'addNew');
			});
		}
	},

	'show': function(req, res, next) {
		// 'findOne' method is default node / sails
		User.findOne(req.param('id'), function foundUser(err, user) {
			if(err) {
				return next(err);
			}
			if(!user) {
				return next('User doesn\'t exist.');
			}
			res.view({
				user: user
			});
		});
	},

	'index': function(req, res, next) {
		User.find({company: req.session.user.company}).exec(function foundUsers(err, users) {
			if(err) {
				return next(err);
			}
			res.view({
				users: users
			});
		});
	},

	'edit': function(req, res, next) {
		User.findOne(req.param('id'), function foundUser(err, user) {
			if (err) {
				return next(err);
			}
			if (!user) {
				return next('User doesn\'t exist.');
			}
			res.view({
				user: user,
				source: req.param('source')
			})
		});
	},

	'update': function(req, res, next) {

		// control which parameters are saved from the form
		// only allow updates to 'admin' attribute if current user is admin
		if (req.session.user.admin) {
			var userObj = {
				firstName: req.param('firstName'),
				lastName: req.param('lastName'),
				title: req.param('title'),
				email: req.param('email'),
				admin: req.param('admin')
			}
		} else {
			var userObj = {
				firstName: req.param('firstName'),
				lastName: req.param('lastName'),
				title: req.param('title'),
				email: req.param('email')
			}
		}

		User.update(req.param('id'), userObj, function userUpdated(err) {
			if (err) {
				req.session.flash = {
					err: err
				}
				return res.redirect('/user/edit/' + req.param('id'));
			}

			var source = req.param('source');
			if (source == 'userIndex') {
				return res.redirect('/user/index');
			} else {
				return res.redirect('/user/show/' + req.param('id'));
			}
		});
	},

	'destroy': function(req, res, next) {
		User.findOne(req.param('id'), function foundUser(err, user){
			console.log('USER:');
			console.log(user);

			if (err) {
				return next(err);
			}
			if (!user) {
				return next();
			}

			User.destroy(req.param('id'), function userDestroyed(err){
				if (err) {
					return next('User doesn\'t exist.');
				}

				// publish update to other sockets
				User.publishUpdate(user.id, {
					name: user.firstName + ' ' + user.lastName,
					action: ' has been deleted'
				});

				User.publishDestroy(user.id);
			});

			return res.redirect('/user/index');
		});
	},

	'subscribe': function(req, res) {
	 	if (!req.isSocket) {
	      return res.badRequest('Not authorized.');
	    }

		User.find({company: req.session.user.company}, function foundUsers(err, users) {
			if (err) {
				return res.serverError(err);
			}

	    	User.watch(req);
			User.subscribe(req, users);

			return res.ok();
		});
	},

	'uploadAvatar': function (req, res, next) {
		console.log('ID: ' + req.param('id'));

	  req.file('avatar').upload({
	    // don't allow the total upload size to exceed ~10MB
	    maxBytes: 10000000,
	    dirname: '../../assets/images'
	  },function whenDone(err, uploadedFiles) {
	    if (err) {
	    	console.log(err);
	      return res.negotiate(err);
	    }

	    // If no files were uploaded, respond with an error.
	    if (uploadedFiles.length === 0){
	    	console.log('no file uploaded');
	      return res.badRequest('No file was uploaded');
	    }


	    // Save the "fd" and the url where the avatar for a user can be accessed
	    var fd = uploadedFiles[0].fd;

	    User.update(req.param('id'), {

	      // Generate a unique URL where the avatar can be downloaded.
	      avatarUrl: require('util').format('%s/user/avatar/%s', sails.getBaseUrl(), req.param('id')),

	      // Grab the first file and use it's `fd` (file descriptor)
	      avatarFd: fd,

	      // Gram the path within the images folder
	      avatarSrc: fd.substr(fd.indexOf('/images/'), fd.length)
	    })
	    .exec(function (err, user){
	    	console.log(user);
	      if (err) return res.negotiate(err);
	      return res.ok();
	    });
	  });
	},

	avatar: function (req, res){
		console.log('ID: ' + req.param('id'));
	  User.findOne(req.param('id')).exec(function (err, user){
	    if (err) return res.negotiate(err);
	    if (!user) return res.notFound();

	    // User has no avatar image uploaded.
	    // (should have never have hit this endpoint and used the default image)
	    if (!user.avatarFd) {
	      return res.notFound();
	    }

	    var SkipperDisk = require('skipper-disk');
	    var fileAdapter = SkipperDisk(/* optional opts */);

	    // necessary?
	    res.writeHead(200);

	    // Stream the file down
	    fileAdapter.read(user.avatarFd)
	    .on('error', function (err){
	    	console.log(err);
	      return res.serverError(err);
	    })
	    .pipe(res);
	  });
	}
};

// create a user record from company and req
function createUser(req, res, company, operation) {
	var userObj = {
		company: company.id,
		firstName: req.param('firstName'),
		lastName: req.param('lastName'),
		title: req.param('title'),
		email: req.param('email'),
		password: req.param('password'),
		confirmation: req.param('confirmation'),
		online: true
	}

	User.create(userObj, function userCreated(err, user) {
		if (err) {
			req.session.flash = {
				err: err
			}
			return res.redirect('/user/new');
		}

		// add action and name attributes to user for flash message
		user.action = ' has signed up and logged in';
		user.name = user.firstName + ' ' + user.lastName;

		// publish create event
		User.publishCreate(user);

		if (operation == 'signup') {
			// new user sign up - log user in
			req.session.authenticated = true;
			req.session.user = user;
			return res.redirect('/company/dashboard/' + company.id);

		} else if (operation == 'addNew') {
			// admin creating new user - take them back to index
			return res.redirect('/user/index/');
		}
	});
}








