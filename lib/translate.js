// A wrapper around `node-polyglot`, with a cached `Polyglot` instance for
// each locale.

var Polyglot = require('node-polyglot');

module.exports = function(moduleNamePrefix) {
  var polyglots = {};
  return function(localeName) {
    var translate = polyglots[localeName];
    if (!translate) {
      // Cache the `locale` instance.
      polyglots[localeName] = translate = new Polyglot({
        locale: localeName,
        phrases: require(moduleNamePrefix + localeName)
      });
    }
    return function(key, options) {
      // Return the current `localeName` if called without arguments.
      if (key == null) {
        return localeName;
      }
      return translate.t(key, options);
    };
  };
};
