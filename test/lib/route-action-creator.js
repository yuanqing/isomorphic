var test = require('tape');

var Store = require('../../lib/store');
var RouteActionTypes = require('../../lib/action-types/route-action-types');
var RouteActionCreator = require('../../lib/action-creators/route-action-creator');

var getHistoryLength = function() {
  return process.browser ? window.history.length : null;
};

var loadView = function(viewName, callback) {
  callback();
};

var routes = {
  'foo': function() {
    this.render('foo', 'bar', 'baz');
  },
  'bar': function() {
    this.route('foo');
  },
  '404': function() {
    this.error('404', 'qux', 'quux');
  }
};

test('`route` returns a function', function(t) {
  t.plan(1);
  var routeActionCreator = new RouteActionCreator(routes);
  var routeAction = routeActionCreator.route('foo');
  t.true(typeof routeAction === 'function');
});

test('route where `render` is called', function(t) {
  t.plan(2);
  var actions = [];
  var store = new Store(function(action, state) {
    return state;
  });
  store.dispatch = function(action, callback) {
    actions.push(action);
    callback && callback();
  };
  var options = {
    translate: function() {}
  };
  if (process.browser) {
    options.store = store;
    options.loadView = loadView;
    options.updateHead = function() {};
  }
  var routeActionCreator = new RouteActionCreator(routes, options);
  var routeAction = routeActionCreator.route('foo', {
    store: store
  });
  var initialHistoryLength = getHistoryLength();
  routeAction(function() {
    if (process.browser) {
      t.equal(getHistoryLength(), initialHistoryLength + 1);
    } else {
      t.pass();
    }
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
          title: 'bar',
          meta: 'baz'
        }
      }
    ]);
  });
});

test('route where `render` is called, with `isPopState` set to `true`', function(t) {
  t.plan(2);
  var actions = [];
  var store = new Store(function(action, state) {
    return state;
  });
  store.dispatch = function(action, callback) {
    actions.push(action);
    callback && callback();
  };
  var options = {
    translate: function() {}
  };
  if (process.browser) {
    options.store = store;
    options.loadView = loadView;
    options.updateHead = function() {};
  }
  var routeActionCreator = new RouteActionCreator(routes, options);
  var routeAction = routeActionCreator.route('foo', {
    store: store,
    isPopstate: true
  });
  var initialHistoryLength = getHistoryLength();
  routeAction(function() {
    if (process.browser) {
      t.equal(getHistoryLength(), initialHistoryLength);
    } else {
      t.pass();
    }
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
          title: 'bar',
          meta: 'baz'
        }
      }
    ]);
  });
});

test('route where `route` is called', function(t) {
  var actions = [];
  var store = new Store(function(action, state) {
    return state;
  });
  store.dispatch = function(action, callback) {
    actions.push(action);
    callback && callback();
  };
  var options = {
    translate: function() {}
  };
  if (process.browser) {
    options.store = store;
    options.loadView = loadView;
    options.updateHead = function() {};
  }
  var routeActionCreator = new RouteActionCreator(routes, options);
  var routeAction = routeActionCreator.route('bar', {
    store: store
  });
  routeAction(function() {
    if (process.browser) {
      // On the client-side, route to `foo`.
      t.looseEqual(actions[0], {
        type: RouteActionTypes.ROUTE_REQUEST,
        payload: {
          url: 'bar'
        }
      });
      t.true(typeof actions[1] === 'function'); // callback
      actions[1](function() {
        t.equal(actions.length, 4);
        t.looseEqual(actions[2], {
          type: RouteActionTypes.ROUTE_REQUEST,
          payload: {
            url: 'foo'
          }
        });
        t.looseEqual(actions[3], {
          type: RouteActionTypes.ROUTE_SUCCESS,
          payload: {
            url: 'foo',
            viewName: 'foo',
            title: 'bar',
            meta: 'baz'
          }
        });
        t.end();
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
        }
      ]);
      t.end();
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
  var options = {
    translate: function() {}
  };
  if (process.browser) {
    options.store = store;
    options.loadView = loadView;
    options.updateHead = function() {};
  }
  var routeActionCreator = new RouteActionCreator(routes, options);
  var routeAction = routeActionCreator.route('404', {
    store: store
  });
  routeAction(function() {
    t.looseEqual(actions, [
      {
        type: RouteActionTypes.ROUTE_REQUEST,
        payload: {
          url: '404'
        }
      },
      {
        type: RouteActionTypes.ROUTE_ERROR,
        payload: {
          url: '404',
          viewName: '404',
          title: 'qux',
          meta: 'quux'
        }
      }
    ]);
  });
});

test('non-existent route', function(t) {
  t.plan(1);
  var actions = [];
  var store = new Store(function(action, state) {
    return state;
  });
  store.dispatch = function(action, callback) {
    actions.push(action);
    callback && callback();
  };
  var options = {
    translate: function() {}
  };
  if (process.browser) {
    options.store = store;
    options.loadView = loadView;
    options.updateHead = function() {};
  }
  var routeActionCreator = new RouteActionCreator(routes, options);
  var routeAction = routeActionCreator.route('fail', {
    store: store
  });
  routeAction(function() {
    t.looseEqual(actions, [
      {
        type: RouteActionTypes.ROUTE_REQUEST,
        payload: {
          url: 'fail'
        }
      },
      {
        type: RouteActionTypes.ROUTE_ERROR,
        payload: {
          url: 'fail',
          viewName: '404',
          title: 'qux',
          meta: 'quux'
        }
      }
    ]);
  });
});
