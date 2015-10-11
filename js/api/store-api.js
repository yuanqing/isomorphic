var firebase = require('js/firebase');

module.exports = {
  getProducts: function() {
    return firebase.get('products');
  },
  setQuantity: function(productSlug, quantity) {
    var product = {};
    product[productSlug] = quantity;
    return firebase.set('products', product);
  }
};
