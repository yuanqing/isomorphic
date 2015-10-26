var StoreActionTypes = require('js/action-types/store-action-types');

module.exports = function(type, payload, state, assign) {
  switch (type) {
  case StoreActionTypes.SET_QUANTITY:
    var products = {};
    products[payload.productSlug] = payload.quantity;
    return assign(state, { products: products });
  case StoreActionTypes.REQUEST_PRODUCTS:
    var newState = {};
    newState[payload.storeSlug] = {
      pending: true,
      products: []
    };
    return assign(state, newState);
  case StoreActionTypes.RECEIVE_PRODUCTS:
    var newState = {};
    newState[payload.storeSlug] = {
      pending: false,
      products: payload.products
    };
    return assign(state, newState);
  default:
    return state;
  }
};
