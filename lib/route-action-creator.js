var Rlite = require('rlite-router');
var each = require('savoy').each;
var RouteActionTypes = require('./route-action-types');
var IS_CLIENT = require('./globals').IS_CLIENT;

var RouteActionCreator = module.exports = function(routes, store) {
  var self = this;
  // Register our route handlers in `routes` with the `Rlite` router.
  self.router = new Rlite();
  each(routes, function(route, url) {
    // Drop the initial `/` for the route `url`.
    self.router.add(url.substring(1), route);
  });
  if (IS_CLIENT) {
    // A `store` is passed in on the client-side only. When on the server-side,
    // we pass in a new, empty store to the `route` method via `options.store`.
    self.store = store;
    // Intercept link clicks.
    var anchorElem = document.createElement('a');
    document.addEventListener('click', function(e) {
      // Exit if the user had pressed the <Command> key or <Shift> key.
      if (e.metaKey || e.shiftKey) {
        return;
      }
      // Find the anchor element that was clicked.
      var elem = e.target;
      while (elem && elem.nodeName !== 'A') {
        elem = elem.parentNode;
      }
      // Exit if `elem` does not have a `parentNode` or `href` attribute, or
      // if the `target` attribute was set but is not `_self`.
      if (!elem || !elem.href || (elem.target && elem.target !== '_self')) {
        return;
      }
      // `elem` is a valid anchor element, and so we intercept it.
      e.stopPropagation();
      e.preventDefault();
      // Strip out the domain name before navigating.
      anchorElem.href = elem.href;
      store.dispatch(self.route(anchorElem.pathname + anchorElem.search + anchorElem.hash));
    });
    // The below event fires when the user clicks the back/forward button, or
    // when we explicitly call window.history.back().
    window.addEventListener('popstate', function() {
      // Set `isPopstate` to `true`.
      store.dispatch(self.route(window.location.pathname, { isPopstate: true }));
    });
  }
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

  routeSuccess: function(url, componentName) {
    return {
      type: RouteActionTypes.ROUTE_SUCCESS,
      payload: {
        url: url,
        componentName: componentName
      }
    };
  },

  routeError: function(url, componentName) {
    return {
      type: RouteActionTypes.ROUTE_ERROR,
      payload: {
        url: url,
        componentName: componentName
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
      var route = self.router.lookup(url.substring(1));
      route.cb.call({
        render: function(componentName) {
          if (IS_CLIENT && !options.isPopstate) {
            // `options.isPopstate` is `true` if and only if routing was
            // triggered by clicking the back/forward buttons on the
            // client-side. We only save to history if `options.isPopstate`
            // is `false`.
            window.history.pushState(null, null, url);
          }
          store.dispatch(self.routeSuccess(url, componentName), callback);
        },
        route: function(redirectUrl) {
          store.dispatch((IS_CLIENT ? self.route.bind(self) : self.redirect)(redirectUrl), callback);
        },
        error: function(componentName) {
          store.dispatch(self.routeError(url, componentName), callback);
        }
      }, route.params, store);
    };
  }

};
