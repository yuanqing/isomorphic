var fold = require('savoy').fold;
var StoreAPI = require('js/api/store-api');
var StoreActionTypes = require('js/action-types/store-action-types');

var StoreActionCreator = module.exports = {

  setQuantity: function(productSlug, quantity) {
    StoreAPI.setQuantity(productSlug, quantity);
    return {
      type: StoreActionTypes.SET_QUANTITY,
      payload: {
        productSlug: productSlug,
        quantity: quantity
      }
    };
  },

  requestProducts: function(storeSlug) {
    return {
      type: StoreActionTypes.REQUEST_PRODUCTS,
      payload: {
        storeSlug: storeSlug
      }
    };
  },

  receiveProducts: function(products) {
    var i = -1;
    return {
      type: StoreActionTypes.RECEIVE_PRODUCTS,
      payload: {
        products: fold(products, [], function(acc, value, key) {
          acc.push({ name: key, id: ++i, quantity: value });
          return acc;
        })
      }
    };
  },

  fetchProducts: function(storeSlug) {
    return StoreAPI.getProducts(storeSlug).then(function(products) {
      return StoreActionCreator.receiveProducts(products);
    });
  }

};
