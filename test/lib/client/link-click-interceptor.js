var fs = require('fs');
var test = require('tape');

var linkClickInterceptor = require('../../../lib/link-click-interceptor');

var $ = function(selector) {
  return document.querySelector(selector);
};

var clickElement = function(element, opts) {
  opts = opts || {};
  opts.bubbles = true;
  opts.cancelable = true;
  var event = new MouseEvent('click', opts);
  element.dispatchEvent(event);
};

var fixture;
var callback;
var teardown;

test('setup', function(t) {
  t.plan(1);
  // Create and attach the fixture to the DOM.
  fixture = document.createElement('div');
  fixture.innerHTML = fs.readFileSync(__dirname + '/fixtures/index.html', 'utf8');
  document.body.appendChild(fixture);
  // Attach events for intercepting link clicks.
  teardown = linkClickInterceptor(function() {
    callback.apply(null, arguments);
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
  clickElement($('.non-link'));
});

test('link', function(t) {
  t.plan(2);
  callback = function(url, options) {
    t.equal(url, '/foo');
    t.equal(options, undefined);
  };
  clickElement($('.link'));
});

test('link, nested', function(t) {
  t.plan(2);
  callback = function(url, options) {
    t.equal(url, '/bar');
    t.equal(options, undefined);
  };
  clickElement($('.link-nested'));
});

test('link, shift-click', function(t) {
  t.plan(1);
  setTimeout(function() {
    t.pass();
  }, 500);
  callback = function() {
    t.fail();
  };
  clickElement($('.link-shift-click'), {
    shiftKey: true
  });
});

test('link, with `target` set to `_blank`', function(t) {
  t.plan(1);
  setTimeout(function() {
    t.pass();
  }, 500);
  callback = function() {
    t.fail();
  };
  clickElement($('.link-target-blank'));
});

test('popstate', function(t) {
  t.plan(5);
  // Add a single item to `window.history`.
  var initialPathname = window.location.pathname;
  window.history.pushState(null, null, '/qux');
  t.equal(window.location.pathname, '/qux');
  // Go `back`.
  callback = function(url, options) {
    t.equal(url, initialPathname);
    t.looseEqual(options, { isPopstate: true });
    // Go `forward`.
    callback = function(url, options) {
      t.equal(url, '/qux');
      t.looseEqual(options, { isPopstate: true });
    };
    window.history.forward();
  };
  window.history.back();
});

test('teardown', function(t) {
  t.plan(1);
  // Unattach events for intercepting link clicks.
  teardown();
  // Remove the fixture.
  fixture.parentNode.removeChild(fixture);
  t.pass();
});
