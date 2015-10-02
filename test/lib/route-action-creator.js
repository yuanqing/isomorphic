var test = require('tape');

var Store = require('../../lib/store');
var RouteActionCreator = require('../../lib/route-action-creator');
var RouteActionTypes = require('../../lib/route-action-types');
var IS_SERVER = typeof window === 'undefined';

var routes = {
  '/foo': function() {
    this.render('FooComponent');
  },
  '/bar': function() {
    this.route('/foo');
  },
  '/baz': function() {
    this.error('BazComponent');
  }
};

test('`route` returns a function', function(t) {
  t.plan(1);
  var routeActionCreator = new RouteActionCreator(routes, null);
  var routeAction = routeActionCreator.route('/foo');
  t.true(typeof routeAction === 'function');
});

test('route where `render` is called', function(t) {
  t.plan(1);
  var actions = [];
  var store = new Store(function(action, state) {
    return state;
  });
  store.dispatch = function(action, callback) {
    actions.push(action);
    if (callback) {
      callback();
    }
  };
  var routeActionCreator = new RouteActionCreator(routes, store);
  var routeAction = routeActionCreator.route('/foo', { store: store });
  routeAction(function() {
    t.looseEqual(actions, [
      {
        type: RouteActionTypes.ROUTE_REQUEST,
        payload: {
          url: '/foo'
        }
      },
      {
        type: RouteActionTypes.ROUTE_SUCCESS,
        payload: {
          url: '/foo',
          componentName: 'FooComponent'
        }
      },
    ]);
  });
});

test('route where `route` is called', function(t) {
  t.plan(1);
  var actions = [];
  var store = new Store(function(action, state) {
    return state;
  });
  store.dispatch = function(action, callback) {
    actions.push(action);
    if (callback) {
      callback();
    }
  };
  var routeActionCreator = new RouteActionCreator(routes, store);
  var routeAction = routeActionCreator.route('/bar', { store: store });
  routeAction(function() {
    if (IS_SERVER) {
      // On the server, we will do a 301 redirect to `/foo`.
      t.looseEqual(actions, [
        {
          type: RouteActionTypes.ROUTE_REQUEST,
          payload: {
            url: '/bar'
          }
        },
        {
          type: RouteActionTypes.REDIRECT,
          payload: {
            redirectUrl: '/foo'
          }
        },
      ]);
    } else {
      // On the client, we will transparently route to the final URL.
      t.looseEqual(actions[0], {
        type: RouteActionTypes.ROUTE_REQUEST,
        payload: {
          url: '/bar'
        }
      });
    }
  });
});

test('route where `error` is called', function(t) {
  t.plan(1);
  var actions = [];
  var store = new Store(function(action, state) {
    return state;
  });
  store.dispatch = function(action, callback) {
    actions.push(action);
    if (callback) {
      callback();
    }
  };
  var routeActionCreator = new RouteActionCreator(routes, store);
  var routeAction = routeActionCreator.route('/baz', { store: store });
  routeAction(function() {
    t.looseEqual(actions, [
      {
        type: RouteActionTypes.ROUTE_REQUEST,
        payload: {
          url: '/baz'
        }
      },
      {
        type: RouteActionTypes.ROUTE_ERROR,
        payload: {
          url: '/baz',
          componentName: 'BazComponent'
        }
      },
    ]);
  });
});
