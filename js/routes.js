var bulk = require('bulk-require');
var routes = bulk(__dirname, ['routes/*.js']).routes;

module.exports = {
  '': routes.home,
  '404': routes.error,
  'help': function() {
    this.route('faq');
  },
  'faq': routes.faq,
  'stores/:storeSlug': routes.store
};

/*
var storeActionCreator = require('./action-creators/store-action-creator');

module.exports = {

  '': function() {
    this.render('home');
  },

  'stores/:storeSlug': function(params, store) {
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
*/
