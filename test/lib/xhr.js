var test = require('tape');
var nock = require('nock');

var xhr = require('../../lib/xhr');

test('has all the RESTful methods', function(t) {
  t.plan(6);
  ['get', 'post', 'put', 'head', 'patch', 'delete'].forEach(function(method) {
    t.true(typeof xhr[method] === 'function');
  });
});

test('get', function(t) {
  t.plan(1);
  nock('https://foo.com')
    .get('/')
    .reply(200, { bar: 'baz' });
  xhr.get('https://foo.com').then(function(result) {
    t.looseEqual(result, { bar: 'baz' });
  }, function() {
    t.fail();
  });
});

test('get, with `options.raw` set to `true`', function(t) {
  t.plan(1);
  nock('https://foo.com')
    .get('/')
    .reply(200, { bar: 'baz' });
  xhr.get('https://foo.com', { raw: true }).then(function(result) {
    t.looseEqual(result, '{"bar":"baz"}');
  }, function() {
    t.fail();
  });
});
