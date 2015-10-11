var storeActionCreator = require('js/action-creators/store-action-creator');

var stores = function() {
  this.render('home');
};

stores.store = function(params, store) {
  var self = this;
  var render = function() {
    self.render('store');
  };
  var storeSlug = params.storeSlug;
  var stores = store.getState().stores; // stores as in shops
  if (stores && stores[storeSlug]) {
    return render();
  }
  store.dispatch(storeActionCreator.fetchProducts(storeSlug), render);
};

module.exports = stores;
