var RouteActionCreator = require('lib/action-creators/route-action-creator');

module.exports = new RouteActionCreator(require('js/routes'), {
  store: process.browser ? require('js/store') : null,
  componentLoader: process.browser ? require('js/view-loader') : null,
  t: require('js/t')
});
