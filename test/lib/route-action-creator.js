var test = require('tape');

var Store = require('../../lib/store');
var promise = require('../../lib/promise');
var IS_CLIENT = require('../../lib/is-client');
var RouteActionTypes = require('../../lib/route-action-types');
var RouteActionCreator = require('../../lib/route-action-creator');

var routes = {
  'foo': function() {
    this.render('foo');
  },
  'bar': function() {
    this.route('foo');
  },
  'baz': function() {
    this.error('baz');
  }
};

var viewLoader = {
  load: function() {
    return promise(function(resolve) {
      resolve('component');
    });
  }
};

test('`route` returns a function', function(t) {
  t.plan(1);
  var routeActionCreator = new RouteActionCreator(routes);
  var routeAction = routeActionCreator.route('foo');
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
    callback && callback();
  };
  var routeActionCreator = new RouteActionCreator(routes, {
    store: store,
    viewLoader: viewLoader
  });
  var routeAction = routeActionCreator.route('foo', { store: store });
  routeAction(function() {
    t.looseEqual(actions, [
      {
        type: RouteActionTypes.ROUTE_REQUEST,
        payload: {
          url: 'foo'
        }
      },
      {
        type: RouteActionTypes.ROUTE_SUCCESS,
        payload: {
          url: 'foo',
          viewName: 'foo',
          component: 'component'
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
    callback && callback();
  };
  var routeActionCreator = new RouteActionCreator(routes, {
    store: store,
    viewLoader: viewLoader
  });
  var routeAction = routeActionCreator.route('bar', { store: store });
  routeAction(function() {
    if (IS_CLIENT) {
      // On the client-side, just route to `foo`.
      t.looseEqual(actions[0], {
        type: RouteActionTypes.ROUTE_REQUEST,
        payload: {
          url: 'bar'
        }
      });
    } else {
      // On the server-side, do a 301 redirect to `foo`.
      t.looseEqual(actions, [
        {
          type: RouteActionTypes.ROUTE_REQUEST,
          payload: {
            url: 'bar'
          }
        },
        {
          type: RouteActionTypes.REDIRECT,
          payload: {
            redirectUrl: 'foo'
          }
        },
      ]);
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
    callback && callback();
  };
  var routeActionCreator = new RouteActionCreator(routes, {
    store: store,
    viewLoader: viewLoader
  });
  var routeAction = routeActionCreator.route('baz', { store: store });
  routeAction(function() {
    t.looseEqual(actions, [
      {
        type: RouteActionTypes.ROUTE_REQUEST,
        payload: {
          url: 'baz'
        }
      },
      {
        type: RouteActionTypes.ROUTE_ERROR,
        payload: {
          url: 'baz',
          viewName: 'baz',
          component: 'component'
        }
      },
    ]);
  });
});
