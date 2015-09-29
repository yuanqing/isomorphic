var Rlite = require('rlite-router');
var each = require('savoy').each;
var RouteActionTypes = require('./route-action-types');
var IS_CLIENT = require('./globals').IS_CLIENT;

var RouteActionCreator = module.exports = function(routes, store) {
  var self = this;
  self.router = new Rlite();
  each(routes, function(route, url) {
    self.router.add(url.substring(1), route);
  });
  self.store = store;
  if (IS_CLIENT) {
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
    window.addEventListener('popstate', function() {
      store.dispatch(self.route(window.location.pathname, true));
    });
  }
};

RouteActionCreator.prototype.routeRequest = function(url) {
  return {
    type: RouteActionTypes.ROUTE_REQUEST,
    payload: {
      url: url
    }
  };
};

RouteActionCreator.prototype.routeSuccess = function(url, componentName) {
  return {
    type: RouteActionTypes.ROUTE_SUCCESS,
    payload: {
      url: url,
      componentName: componentName
    }
  };
};

RouteActionCreator.prototype.routeError = function(url, componentName) {
  return {
    type: RouteActionTypes.ROUTE_ERROR,
    payload: {
      url: url,
      componentName: componentName
    }
  };
};

RouteActionCreator.prototype.redirect = function(redirectUrl) {
  return {
    type: RouteActionTypes.REDIRECT,
    payload: {
      redirectUrl: redirectUrl
    }
  };
};

RouteActionCreator.prototype.route = function(url, isPopstate) {
  // `isPopstate` is `true` when going back or forward on the client-side.
  var self = this;
  return function(resolve) {
    var store = self.store;
    store.dispatch(self.routeRequest(url));
    var route = self.router.lookup(url.substring(1));
    route.cb.call({
      render: function(componentName) {
        if (IS_CLIENT && !isPopstate) {
          window.history.pushState(null, null, url);
        }
        store.dispatch(self.routeSuccess(url, componentName));
        resolve();
      },
      route: function(redirectUrl) {
        store.dispatch((IS_CLIENT ? self.route.bind(self) : self.redirect)(redirectUrl));
        resolve();
      },
      error: function(componentName) {
        store.dispatch(self.routeError(url, componentName));
        resolve();
      }
    }, route.params, store);
  };
};
