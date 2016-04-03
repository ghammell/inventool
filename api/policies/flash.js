module.exports = function(req, res, next) {

	// clear res flash
	res.locals.flash = {};

	// if req flash is blank, return
	if (!req.session.flash) {
		return next()
	}

	// if not, set res flash equal to req flash
	res.locals.flash = _.clone(req.session.flash);

	// clear req flash
	req.session.flash = {};

	return next();
}