module.exports = function(action, state, assign) {
  return {
    locale: require('lib/reducers/locale-reducer')(action, state.locale, assign),
    route: require('lib/reducers/route-reducer')(action, state.route, assign),
    stores: require('./stores-reducer')(action, state.stores, assign),
  };
};
