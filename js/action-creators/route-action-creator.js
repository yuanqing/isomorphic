var RouteActionCreator = require('lib/route-action-creator');
var store = require('js/store');
var routes = require('js/routes');
var componentLoader = require('js/component-loader');

module.exports = new RouteActionCreator(routes, {
  store: store,
  componentLoader: componentLoader
});
