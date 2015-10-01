var test = require('tape');

var Store = require('../../lib/store');
var RouteActionCreator = require('../../lib/route-action-creator');
var RouteActionTypes = require('../../lib/route-action-types');
var IS_SERVER = typeof window === 'undefined';

var reducer = function(action, state) {
  return state;
};

var routes = {
  '/foo': function() {
    this.render('FooComponent');
  },
  '/bar': function() {
    this.route('/foo');
  },
  '/baz': function() {
    this.error('NotFoundComponent');
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
  var store = new Store(reducer);
  store.dispatch = function(action) {
    actions.push(action);
  };
  var routeActionCreator = new RouteActionCreator(routes, store);
  var routeAction = routeActionCreator.route('/foo');
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
  var store = new Store(reducer);
  store.dispatch = function(action) {
    actions.push(action);
  };
  var routeActionCreator = new RouteActionCreator(routes, store);
  var routeAction = routeActionCreator.route('/bar');
  routeAction(function() {
    if (IS_SERVER) {
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
  var store = new Store(reducer);
  store.dispatch = function(action) {
    actions.push(action);
  };
  var routeActionCreator = new RouteActionCreator(routes, store);
  var routeAction = routeActionCreator.route('/baz');
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
          componentName: 'NotFoundComponent'
        }
      },
    ]);
  });
});
