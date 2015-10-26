var test = require('tape');

var assign = require('../../lib/assign');
var routeReducer = require('../../lib/reducers/route-reducer');
var RouteActionCreator = require('../../lib/action-creators/route-action-creator');

var routeActionCreator = new RouteActionCreator({});

test('invalid action', function(t) {
  t.plan(1);
  t.looseEqual(routeReducer('foo', {}, { bar: 'baz' }, assign), { bar: 'baz' });
});

test('route to a given `url`', function(t) {
  t.plan(1);
  var action = routeActionCreator.route('/foo');
  t.looseEqual(routeReducer(action.type, action.payload, {}, assign), {});
});

test('route request', function(t) {
  t.plan(1);
  var action = routeActionCreator.routeRequest('/foo');
  t.looseEqual(routeReducer(action.type, action.payload, {}, assign), {
    url: '/foo',
    isPending: true
  });
});

test('route success', function(t) {
  t.plan(1);
  var action = routeActionCreator.routeSuccess('/foo', 'bar', 'baz', 'qux');
  t.looseEqual(routeReducer(action.type, action.payload, {}, assign), {
    isPending: false,
    url: '/foo',
    viewName: 'bar',
    title: 'baz',
    meta: 'qux'
  });
});

test('route error', function(t) {
  t.plan(1);
  var action = routeActionCreator.routeError('/foo', 'bar', 'baz', 'qux');
  t.looseEqual(routeReducer(action.type, action.payload, {}, assign), {
    error: true,
    isPending: false,
    url: '/foo',
    viewName: 'bar',
    title: 'baz',
    meta: 'qux'
  });
});

test('redirect to a given `url`', function(t) {
  t.plan(1);
  var action = routeActionCreator.redirect('/baz');
  t.looseEqual(routeReducer(action.type, action.payload, {}, assign), {
    redirectUrl: '/baz'
  });
});
