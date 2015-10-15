// A wrapper around `node-polyglot`, with a cached `Polyglot` instance for
// each locale.

var Polyglot = require('node-polyglot');

module.exports = function(moduleNamePrefix) {
  var polyglots = {};
  return function(locale) {
    var translate = polyglots[locale];
    if (!translate) {
      // Cache the `locale` instance.
      polyglots[locale] = translate = new Polyglot({
        locale: locale,
        phrases: require(moduleNamePrefix + locale)
      });
    }
    return function(key, options) {
      // Return the active `locale` if called without arguments.
      if (key == null) {
        return locale;
      }
      return translate.t(key, options);
    };
  };
};
