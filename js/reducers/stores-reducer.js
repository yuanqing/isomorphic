var StoreActionTypes = require('js/action-types/store-action-types');

module.exports = function(action, state, assign) {
  switch (action.type) {
  case StoreActionTypes.SET_QUANTITY:
    var products = {};
    products[action.payload.productSlug] = action.payload.quantity;
    return assign(state, { products: products });
  case StoreActionTypes.REQUEST_PRODUCTS:
    var newState = {};
    newState[action.payload.storeSlug] = {
      pending: true,
      products: []
    };
    return assign(state, newState);
  case StoreActionTypes.RECEIVE_PRODUCTS:
    var newState = {};
    newState[action.payload.storeSlug] = {
      pending: false,
      products: action.payload.products
    };
    return assign(state, newState);
  default:
    return state;
  }
};
