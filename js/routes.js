var bulk = require('bulk-require');
var routes = bulk(__dirname, ['routes/*.js']).routes;

module.exports = {
  '': routes.home,
  '404': routes.error,
  'help': routes.help,
  'faq': routes.faq,
  'stores/:storeSlug': routes.store
};
