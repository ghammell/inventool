/**
 * Product.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
  	name: {
  		type: 'string',
  		required: true
  	},
  	company: {
  		model: 'company',
  		required: true
  	},
    unitPrice: {
      type: 'integer',
      required: true
    },
  	inventoryOnHand: {
  		type: 'integer',
  		defaultsTo: 0.00
  	},
  	description: {
  		type: 'string'
  	},
  	purchases: {
  		collection: 'purchase',
  		via: 'product'
  	},
  	sales: {
  		collection: 'sale',
  		via: 'product',
  		through: 'salelineitem'
  	},
    barCodeNumber: {
      type: 'string'
    }
  }
};

