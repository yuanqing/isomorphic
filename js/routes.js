var bulk = require('bulk-require');
var controllers = bulk(__dirname, ['controllers/*.js']).controllers;

module.exports = {
  '': controllers.home,
  '404': controllers.error,
  'help': controllers.help,
  'faq': controllers.faq,
  'stores': controllers.stores,
  'stores/:storeSlug': controllers.stores.store
};
