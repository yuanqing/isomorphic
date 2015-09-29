var StoreActionCreator = require('./action-creators/store-action-creator');

module.exports = {

  '/': function() {
    this.render('HomeComponent');
  },

  '/stores/:store_slug': function(params, store) {
    var self = this;
    var render = function() {
      self.render('StoreComponent');
    };
    var storeSlug = params.store_slug;
    var stores = store.getState().stores; // stores as in shops
    if (stores && stores[storeSlug]) {
      return render();
    }
    store.dispatch(StoreActionCreator.fetchProducts(storeSlug), render);
  },

  '/help': function() {
    this.route('/faq');
  },

  '/faq': function() {
    this.render('FaqComponent');
  },

  '/404': function() {
    this.error('NotFoundComponent');
  }

};
