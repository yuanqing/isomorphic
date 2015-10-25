var test = require('tape');

var assign = require('../../lib/assign');
var routeReducer = require('../../lib/reducers/route-reducer');
var RouteActionCreator = require('../../lib/action-creators/route-action-creator');

var routeActionCreator = new RouteActionCreator({});

test('invalid action', function(t) {
  t.plan(1);
  t.looseEqual(routeReducer({ type: 'foo' }, { bar: 'baz' }, assign), { bar: 'baz' });
});

test('route to a given `url`', function(t) {
  t.plan(1);
  t.looseEqual(routeReducer(routeActionCreator.route('/foo'), {}, assign), {});
});

test('route request', function(t) {
  t.plan(1);
  t.looseEqual(routeReducer(routeActionCreator.routeRequest('/foo'), {}, assign), {
    url: '/foo',
    isPending: true
  });
});

test('route success', function(t) {
  t.plan(1);
  t.looseEqual(routeReducer(routeActionCreator.routeSuccess('/foo', 'bar', 'baz', 'qux'), {}, assign), {
    isPending: false,
    url: '/foo',
    viewName: 'bar',
    title: 'baz',
    meta: 'qux'
  });
});

test('route error', function(t) {
  t.plan(1);
  t.looseEqual(routeReducer(routeActionCreator.routeError('/foo', 'bar', 'baz', 'qux'), {}, assign), {
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
  t.looseEqual(routeReducer(routeActionCreator.redirect('/baz'), {}, assign), {
    redirectUrl: '/baz'
  });
});
