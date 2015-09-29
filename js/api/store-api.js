var firebase = require('../firebase');

module.exports = {
  getProducts: function(storeSlug) {
    return firebase.get('products');
  },
  setQuantity: function(productSlug, quantity) {
    var product = {};
    product[productSlug] = quantity;
    return firebase.update('products', product);
  }
};
