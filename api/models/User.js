/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  schema: true,
  attributes: {
  	firstName: {
  		type: 'string',
  		required: true  		
  	},
  	lastName: {
  		type: 'string',
  		required: true
  	},
  	title: {
  		type: 'string'
  	},
  	email: {
  		type: 'string',
  		email: true,
  		required: true,
  		unique: true
  	},
  	encryptedPassword: {
  		type: 'string'
  	}
  },

  beforeCreate: function(values, next) {
    if (!values.password || values.password != values.confirmation) {
      return (next({err: ["Password doesn't match password confirmation."]}))
    }

    require('bcrypt').hash(values.password, 10, function passwordEncrypted(err, encryptedPassword) {
      if(err) {
        return next(err);
      }

      values.encryptedPassword = encryptedPassword;
      next();
    });
  }
};

