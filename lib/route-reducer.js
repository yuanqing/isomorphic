var RouteActionTypes = require('./route-action-types');

module.exports = function(action, state, assign) {
  switch (action.type) {
  case RouteActionTypes.REDIRECT:
    return assign(state, action.payload);
  case RouteActionTypes.ROUTE_REQUEST:
    return assign(state, action.payload, {
      isPending: true
    });
  case RouteActionTypes.ROUTE_SUCCESS:
    return assign(state, action.payload, {
      isPending: false
    });
  case RouteActionTypes.ROUTE_ERROR:
    return assign(state, action.payload, {
      isPending: false,
      error: true
    });
  default:
    return state;
  }
};
