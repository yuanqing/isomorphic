var storeActionCreator = require('./action-creators/store-action-creator');

module.exports = {

  '': function() {
    this.render('home');
  },

  'stores/:store_slug': function(params, store) {
    var self = this;
    var render = function() {
      self.render('store');
    };

    var storeSlug = params.store_slug;
    var stores = store.getState().stores; // stores as in shops
    if (stores && stores[storeSlug]) {
      return render();
    }
    store.dispatch(storeActionCreator.fetchProducts(storeSlug), render);
  },

  'help': function() {
    this.route('faq');
  },

  'faq': function() {
    this.render('faq');
  },

  '404': function() {
    this.error('404');
  }

};
