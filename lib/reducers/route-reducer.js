var RouteActionTypes = require('../action-types/route-action-types');

module.exports = function(type, payload, state, assign) {
  switch (type) {
  case RouteActionTypes.REDIRECT:
    return assign(state, payload);
  case RouteActionTypes.ROUTE_REQUEST:
    return assign(state, payload, {
      isPending: true
    });
  case RouteActionTypes.ROUTE_SUCCESS:
    return assign(state, payload, {
      isPending: false
    });
  case RouteActionTypes.ROUTE_ERROR:
    return assign(state, payload, {
      isPending: false,
      error: true
    });
  default:
    return state;
  }
};
