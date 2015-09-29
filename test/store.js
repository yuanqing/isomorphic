var test = require('tape');

var Store = require('../lib/store');
var promise = require('../lib/promise');

test('get state', function(t) {
  t.plan(1);
  var reducer = function() {};
  var state = {
    foo: 42
  };
  var store = new Store(reducer, state);
  t.equal(store.getState(), state);
});

test('dispatch a synchronous action', function(t) {
  t.plan(3);
  var synchronousAction = {
    type: 'FOO'
  };
  var reducer = function(action, state, assign) {
    t.equal(action, synchronousAction);
    return assign(state, {
      foo: 3.142,
      bar: 'baz'
    });
  };
  var state = {
    foo: 42
  };
  var store = new Store(reducer, state);
  store.dispatch(synchronousAction);
  var newState = store.getState();
  t.true(newState !== state);
  t.looseEqual(newState, {
    foo: 3.142,
    bar: 'baz'
  });
});

test('dispatch an asynchronous action (function)', function(t) {
  t.plan(2);
  var reducer = function() {};
  var state = {
    foo: 42
  };
  var store = new Store(reducer, state);
  var asynchronousAction = function(resolve) {
    t.equal(this, store);
    resolve();
  };
  store.dispatch(asynchronousAction).then(function() {
    t.pass();
  });
});

test('dispatch an asynchronous action (function)', function(t) {
  var reducer = function() {};
  var state = {
    foo: 42
  };
  var store = new Store(reducer, state);
  var asynchronousAction = promise(function(resolve) {
    t.pass();
    resolve();
  });
  var doneCallback = function() {
    t.end();
  };
  store.dispatch(asynchronousAction, doneCallback);
});

test('dispatch an asynchronous action that in turn dispatches an action', function(t) {
  var reducer = function() {};
  var state = {
    foo: 42
  };
  var store = new Store(reducer, state);
  var asynchronousAction = promise(function(resolve) {
    t.pass();
    // Dispatch a synchronous action.
    resolve({
      type: 'FOO'
    });
  });
  var doneCallback = function() {
    t.end();
  };
  store.dispatch(asynchronousAction, doneCallback);
});
