var Rlite = require('rlite-router');
var each = require('savoy').each;
var RouteActionTypes = require('../action-types/route-action-types');

var RouteActionCreator = module.exports = function(routes, options) {
  options = options || {};
  var self = this;
  // Register our route handlers in `routes` with the `Rlite` router.
  self.router = new Rlite();
  each(routes, function(route, url) {
    self.router.add(url, route);
  });
  if (process.browser) {
    self.store = options.store;
    self.componentLoader = options.componentLoader;
  }
  self.i18n = options.i18n;
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

  routeSuccess: function(url, viewName) {
    return {
      type: RouteActionTypes.ROUTE_SUCCESS,
      payload: {
        url: url,
        viewName: viewName
      }
    };
  },

  routeError: function(url, viewName) {
    return {
      type: RouteActionTypes.ROUTE_ERROR,
      payload: {
        url: url,
        viewName: viewName
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
    var i18n = self.i18n;
    // We must pass in a new `store` via `options.store` when doing a
    // server-side render.
    var store = process.browser ? self.store : options.store;
    return function(callback) {
      store.dispatch(self.routeRequest(url));
      var route = self.router.lookup(url);
      if (!route.cb) {
        route = self.router.lookup('404');
      }
      route.cb.call({
        t: i18n(store.getState().locale),
        render: function(viewName, viewMeta) {
          viewMeta = viewMeta || {};
          var routeSuccess = function() {
            store.dispatch(self.routeSuccess(url, viewName), callback);
          };
          if (process.browser) {
            if (!options.isPopstate) {
              // `options.isPopstate` is `true` if and only if routing was
              // triggered by clicking the back/forward buttons on the
              // client-side. We only save to history if `options.isPopstate`
              // is `false`.
              window.history.pushState(null, null, url);
            }
            if (viewMeta.title) {
              document.title = viewMeta.title;
            }
            self.componentLoader(viewName, routeSuccess);
          } else {
            routeSuccess();
          }
        },
        route: function(redirectUrl) {
          store.dispatch((process.browser ? self.route.bind(self) : self.redirect)(redirectUrl), callback);
        },
        error: function(viewName) {
          var routeError = function() {
            store.dispatch(self.routeError(url, viewName), callback);
          };
          if (process.browser) {
            self.componentLoader(viewName, routeError);
          } else {
            routeError();
          }
        }
      }, route.params, store);
    };
  }

};
