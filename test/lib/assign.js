var test = require('tape');

var assign = require('lib/assign');

test('does not mutate the first argument', function(t) {
  t.plan(3);
  var foo = {
    x: 42,
    y: 'old'
  };
  var bar = {
    y: 'new'
  };
  var result = assign(foo, bar);
  t.ok(result !== foo);
  t.looseEqual(result, {
    x: 42,
    y: 'new'
  });
  t.looseEqual(foo, {
    x: 42,
    y: 'old'
  });
});

test('takes any number of the arguments', function(t) {
  t.plan(1);
  var foo = {
    x: 42,
    y: 'old'
  };
  var bar = {
    y: 'new'
  };
  var baz = {
    z: 3.142
  };
  t.looseEqual(assign(foo, bar, baz), {
    x: 42,
    y: 'new',
    z: 3.142
  });
});
