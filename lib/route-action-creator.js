var Rlite = require('rlite-router');
var each = require('savoy').each;
var RouteActionTypes = require('./route-action-types');
var IS_CLIENT = require('./is-client');

var RouteActionCreator = module.exports = function(routes, options) {
  options = options || {};
  var self = this;
  // Register our route handlers in `routes` with the `Rlite` router.
  self.router = new Rlite();
  each(routes, function(route, url) {
    self.router.add(url, route);
  });
  if (IS_CLIENT) {
    self.store = options.store;
  }
  self.viewLoader = options.viewLoader;
};

RouteActionCreator.prototype = {

  routeRequest: function(url) {
    return {
      type: RouteActionTypes.ROUTE_REQUEST,
      payload: {
        url: url
      }
    };
  },

  routeSuccess: function(url, viewName, component) {
    return {
      type: RouteActionTypes.ROUTE_SUCCESS,
      payload: {
        url: url,
        viewName: viewName,
        component: component
      }
    };
  },

  routeError: function(url, viewName, component) {
    return {
      type: RouteActionTypes.ROUTE_ERROR,
      payload: {
        url: url,
        viewName: viewName,
        component: component
      }
    };
  },

  redirect: function(redirectUrl) {
    return {
      type: RouteActionTypes.REDIRECT,
      payload: {
        redirectUrl: redirectUrl
      }
    };
  },

  route: function(url, options) {
    var self = this;
    options = options || {};
    // We must pass in a new, empty `store` via `options.store` when doing a
    // server-side render.
    var store = IS_CLIENT ? self.store : options.store;
    return function(callback) {
      store.dispatch(self.routeRequest(url));
      var route = self.router.lookup(url);
      if (!route.cb) {
        route = self.router.lookup('404');
      }
      route.cb.call({
        render: function(viewName) {
          if (IS_CLIENT && !options.isPopstate) {
            // `options.isPopstate` is `true` if and only if routing was
            // triggered by clicking the back/forward buttons on the
            // client-side. We only save to history if `options.isPopstate`
            // is `false`.
            window.history.pushState(null, null, url);
          }
          self.viewLoader.load(viewName).then(function(component) {
            store.dispatch(self.routeSuccess(url, viewName, component), callback);
          });
        },
        route: function(redirectUrl) {
          store.dispatch((IS_CLIENT ? self.route.bind(self) : self.redirect)(redirectUrl), callback);
        },
        error: function(viewName) {
          self.viewLoader.load(viewName).then(function(component) {
            store.dispatch(self.routeError(url, viewName, component), callback);
          });
        }
      }, route.params, store);
    };
  }

};
