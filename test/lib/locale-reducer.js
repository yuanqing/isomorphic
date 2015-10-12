var test = require('tape');

var assign = require('../../lib/assign');
var localeReducer = require('../../lib/reducers/locale-reducer');
var LocaleActionCreator = require('../../lib/action-creators/locale-action-creator');

test('invalid action', function(t) {
  t.plan(1);
  t.looseEqual(localeReducer({ type: 'foo' }, { bar: 'baz' }, assign), { bar: 'baz' });
});

test('set to the given `locale`', function(t) {
  t.plan(1);
  t.looseEqual(localeReducer(LocaleActionCreator.setLocale('en-us'), undefined, assign), 'en-us');
});
