var test = require('tape');

var xhr = require('lib/xhr');
var config = require('../../config');

var URL = 'http://localhost:' + config.testPort;

test('has all the RESTful methods', function(t) {
  t.plan(6);
  ['get', 'post', 'put', 'head', 'patch', 'delete'].forEach(function(method) {
    t.true(typeof xhr[method] === 'function');
  });
});

test('GET', function(t) {
  t.plan(1);
  xhr.get(URL).then(function(result) {
    t.looseEqual(result, { foo: 'pass' });
  }, t.fail);
});

test('GET with `raw` set to `true`', function(t) {
  t.plan(1);
  xhr.get(URL, { raw: true }).then(function(result) {
    t.equal(result, JSON.stringify({ foo: 'pass' }));
  }, t.fail);
});

test('GET; error', function(t) {
  t.plan(1);
  xhr.get(URL + '/error').then(t.fail, function() {
    t.pass();
  });
});
