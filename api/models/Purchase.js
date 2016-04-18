/**
 * Purchase.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	company: {
  		model: 'company',
  		required: true
  	},
  	product: {
  		model: 'product',
  		required: true
  	},
  	quantity: {
  		type: 'integer',
  		required: true
  	}
  }
};

