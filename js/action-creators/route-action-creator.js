var RouteActionCreator = require('lib/action-creators/route-action-creator');

module.exports = new RouteActionCreator(require('js/routes'), {
  store: process.browser ? require('js/store') : null,
  loadView: process.browser ? require('js/load-view') : null,
  updateHead: process.browser ? require('js/update-head') : null,
  t: require('js/translate')
});
