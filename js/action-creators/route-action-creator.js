var RouteActionCreator = require('../../lib/route-action-creator');
var store = require('../store');
var routes = require('../routes');
var componentLoader = require('../component-loader');

module.exports = new RouteActionCreator(routes, {
  store: store,
  componentLoader: componentLoader
});
