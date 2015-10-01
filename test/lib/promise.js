var test = require('tape');
var promise = require('../../lib/promise');

test('`promise.all` accepts an array', function(t) {
  t.plan(1);
  promise.all([
    promise(function(resolve) {
      setTimeout(function() {
        resolve('foo');
      }, 0);
    }),
    promise(function(resolve) {
      resolve(42);
    })
  ]).then(function(result) {
    t.looseEquals(result, ['foo', 42]);
  });
});

test('`promise.all` accepts an object', function(t) {
  t.plan(1);
  promise.all({
    x: promise(function(resolve) {
      setTimeout(function() {
        resolve('foo');
      }, 0);
    }),
    y: promise(function(resolve) {
      resolve(42);
    })
  }).then(function(result) {
    t.looseEquals(result, {
      x: 'foo',
      y: 42
    });
  });
});
