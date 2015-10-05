var test = require('tape');

var xhr = require('../../lib/xhr');

test('has all the RESTful methods', function(t) {
  t.plan(6);
  ['get', 'post', 'put', 'head', 'patch', 'delete'].forEach(function(method) {
    t.true(typeof xhr[method] === 'function');
  });
});
