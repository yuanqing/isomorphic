var routeReducer = require('../../lib/route-reducer');

module.exports = function(action, state, assign) {
  return {
    route: routeReducer(action, state.route, assign),
    stores: require('./stores-reducer')(action, state.stores, assign)
  };
};
