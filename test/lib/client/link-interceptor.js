var fs = require('fs');
var test = require('tape');
var click = require('phantom-click');
var linkInterceptor = require('../../../lib/link-interceptor');

var $ = function(selector) {
  return document.querySelector(selector);
};

var fixture;
var callback;
var teardown;

test('setup', function(t) {
  t.plan(1);
  // Create and attach the fixture to the DOM.
  fixture = document.createElement('div');
  fixture.innerHTML = fs.readFileSync(__dirname + '/fixture.html', 'utf-8');
  document.body.appendChild(fixture);
  // Hook up events.
  teardown = linkInterceptor(function(url, options) {
    callback(url, options);
  });
  t.pass();
});

test('non-link', function(t) {
  t.plan(1);
  setTimeout(function() {
    t.pass();
  }, 500);
  callback = function() {
    t.fail();
  };
  click($('.non-link'));
});

test('internal link', function(t) {
  t.plan(2);
  callback = function(url, options) {
    t.equal(url, '/foo');
    t.equal(options, undefined);
  };
  click($('.link'));
});

test('internal link, nested', function(t) {
  t.plan(2);
  callback = function(url, options) {
    t.equal(url, '/bar');
    t.equal(options, undefined);
  };
  click($('.link-nested'));
});

test('internal link, shift-click', function(t) {
  t.plan(1);
  setTimeout(function() {
    t.pass();
  }, 500);
  callback = function() {
    t.fail();
  };
  click($('.link'), {
    shiftKey: true
  });
});

// test('internal link, with `target` set to `_blank`', function(t) {
//   t.plan(1);
//   setTimeout(function() {
//     t.pass();
//   }, 500);
//   callback = function() {
//     t.fail();
//   };
//   click($('.link-target-blank'));
// });

test('popstate', function(t) {
  t.plan(3);
  // Add a single item to `window.history`.
  var initialPathname = window.location.pathname;
  window.history.pushState(null, null, '/qux');
  t.equal(window.location.pathname, '/qux');
  // Go back.
  window.history.back();
  callback = function(url, options) {
    t.equal(url, initialPathname);
    t.looseEqual(options, { isPopstate: true });
    // Unset the `callback`, before going forward.
    callback = function() {};
    window.history.forward();
  };
});

test('teardown', function(t) {
  t.plan(1);
  // Unattach the bound events.
  teardown();
  // Remove the fixture.
  fixture.parentNode.removeChild(fixture);
  t.pass();
});
