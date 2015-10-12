var RouteActionCreator = require('lib/action-creators/route-action-creator');
var store = require('js/store');
var routes = require('js/routes');
var componentLoader = process.browser ? require('js/view-loader') : null;

module.exports = new RouteActionCreator(routes, {
  store: store,
  componentLoader: componentLoader
});
