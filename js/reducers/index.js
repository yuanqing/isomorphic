module.exports = function(action, state, assign) {
  return {
    locale: require('./locale-reducer')(action, state.locale, assign),
    route: require('lib/route-reducer')(action, state.route, assign),
    stores: require('./stores-reducer')(action, state.stores, assign),
  };
};
