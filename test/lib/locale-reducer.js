var test = require('tape');

var assign = require('../../lib/assign');
var localeReducer = require('../../lib/reducers/locale-reducer');
var LocaleActionCreator = require('../../lib/action-creators/locale-action-creator');

test('invalid action', function(t) {
  t.plan(1);
  t.looseEqual(localeReducer('foo', {}, { bar: 'baz' }, assign), { bar: 'baz' });
});

test('set to the given `locale`', function(t) {
  t.plan(1);
  var action = LocaleActionCreator.setLocale({
    language: 'en',
    country: 'us'
  });
  t.looseEqual(localeReducer(action.type, action.payload, {}, assign), 'en-us');
});
