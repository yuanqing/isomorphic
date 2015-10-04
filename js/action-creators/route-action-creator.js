var RouteActionCreator = require('../../lib/route-action-creator');
var store = require('../store');
var routes = require('../routes');
var viewLoader = require('../view-loader');

module.exports = new RouteActionCreator(routes, {
  store: store,
  viewLoader: viewLoader
});
