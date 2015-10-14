var each = require('savoy').each;
var Rlite = require('rlite-router');
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
    self.loadView = options.loadView;
    self.updateHead = options.updateHead;
  }
  self.t = options.t;
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

  routeSuccess: function(url, viewName, title, meta) {
    return {
      type: RouteActionTypes.ROUTE_SUCCESS,
      payload: {
        url: url,
        viewName: viewName,
        title: title,
        meta: meta
      }
    };
  },

  routeError: function(url, viewName, title, meta) {
    return {
      type: RouteActionTypes.ROUTE_ERROR,
      payload: {
        url: url,
        viewName: viewName,
        title: title,
        meta: meta
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
    var t = self.t;
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
        t: t(store.getState().locale),
        render: function(viewName, title, meta) {
          var routeSuccess = function() {
            store.dispatch(self.routeSuccess(url, viewName, title, meta), callback);
          };
          if (process.browser) {
            if (!options.isPopstate) {
              // `options.isPopstate` is `true` if and only if routing was
              // triggered by clicking the back/forward buttons on the
              // client-side. We only save to history if `options.isPopstate`
              // is `false`.
              window.history.pushState(null, null, url);
            }
            self.updateHead(title, meta);
            self.loadView(viewName, routeSuccess);
          } else {
            routeSuccess();
          }
        },
        route: function(redirectUrl) {
          store.dispatch((process.browser ? self.route.bind(self) : self.redirect)(redirectUrl), callback);
        },
        error: function(viewName, title, meta) {
          var routeError = function() {
            store.dispatch(self.routeError(url, viewName, title, meta), callback);
          };
          if (process.browser) {
            self.updateHead(title, meta);
            self.loadView(viewName, routeError);
          } else {
            routeError();
          }
        }
      }, route.params, store);
    };
  }

};
