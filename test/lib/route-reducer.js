var test = require('tape');

var assign = require('../../lib/assign');
var routeReducer = require('../../lib/route-reducer');
var RouteActionCreator = require('../../lib/route-action-creator');

var routeActionCreator = new RouteActionCreator({});

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
  t.looseEqual(routeReducer(routeActionCreator.routeSuccess('/foo', 'bar', 'baz'), {}, assign), {
    url: '/foo',
    viewName: 'bar',
    component: 'baz',
    isPending: false
  });
});

test('route error', function(t) {
  t.plan(1);
  t.looseEqual(routeReducer(routeActionCreator.routeError('/foo', 'bar', 'baz'), {}, assign), {
    url: '/foo',
    viewName: 'bar',
    component: 'baz',
    isPending: false,
    error: true
  });
});

test('redirect to a given `url`', function(t) {
  t.plan(1);
  t.looseEqual(routeReducer(routeActionCreator.redirect('/baz'), {}, assign), {
    redirectUrl: '/baz'
  });
});
