var routes = require('../routes');
var RouteActionCreator = require('../../lib/route-action-creator');
var store = require('../store');

module.exports = new RouteActionCreator(routes, store);
