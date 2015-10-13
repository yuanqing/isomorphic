var RouteActionCreator = require('lib/action-creators/route-action-creator');

var i18n = require('js/i18n');
var routes = require('js/routes');
var componentLoader = process.browser ? require('js/view-loader') : null;

module.exports = new RouteActionCreator(routes, {
  store: process.browser ? require('js/store') : null,
  componentLoader: componentLoader,
  i18n: i18n
});
