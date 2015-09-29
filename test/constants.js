var test = require('tape');
var makeConstants = require('../lib/constants');

test('returns an object where each key equals its value', function(t) {
  t.plan(1);
  t.looseEqual(makeConstants(['FOO', 'BAR', 'BAZ']), {
    FOO: 'FOO',
    BAR: 'BAR',
    BAZ: 'BAZ'
  });
});
