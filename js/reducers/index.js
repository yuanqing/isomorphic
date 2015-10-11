var routeReducer = require('../../lib/route-reducer');

module.exports = function(action, state, assign) {
  return {
    locale: require('./locale-reducer')(action, state.locale, assign),
    route: routeReducer(action, state.route, assign),
    stores: require('./stores-reducer')(action, state.stores, assign),
  };
};
