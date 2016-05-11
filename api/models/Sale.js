/**
 * Sale.js
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
  	products: {
  		collection: 'product',
  		via: 'sale',
      through: 'salelineitem'
  	},
  	customer: {
  		model: 'customer',
  		via: 'sales'
  	},
    totalPrice: {
      type: 'integer',
      defaultsTo: 0.00
    }
  }
};

