module.exports = function(type, payload, state, assign) {
  return {
    locale: require('lib/reducers/locale-reducer')(type, payload, state.locale, assign),
    route: require('lib/reducers/route-reducer')(type, payload, state.route, assign),
    stores: require('./stores-reducer')(type, payload, state.stores, assign),
  };
};
