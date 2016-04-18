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
    admin: {
      type: 'boolean',
      defaultsTo: false
    },
    online: {
      type: 'boolean',
      defaultsTo: false
    },
  	encryptedPassword: {
  		type: 'string'
  	},
    company: {
      model: 'company',
      required: true
    }
  },

  beforeValidate: function(values, next) {
    if (values.admin != undefined) {
      if (values.admin === 'unchecked') {
        values.admin = false;
      } else if (values.admin[1] === 'on') {
        values.admin = true;
      }
    }

    next();
  },

  beforeCreate: function(values, next) {
    if (!values.password || values.password != values.confirmation) {
      return (next({err: ["Password doesn't match password confirmation."]}))
    }

    Company.findOne(values.company, function(err, company) {    
      // if this is the first user in the company, make them an admin by default
      if (company.users.length == 0) {
        values.admin = true;
      }

      // bcrypt store hashed password for user
      require('bcrypt').hash(values.password, 10, function passwordEncrypted(err, encryptedPassword) {
        if(err) {
          return next(err);
        }

        values.encryptedPassword = encryptedPassword;
        next();
      });

    });
  }
};

