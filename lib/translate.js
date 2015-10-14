var Polyglot = require('node-polyglot');

module.exports = function(moduleNamePrefix) {
  var polyglots = {};
  return function(locale) {
    var polyglot = polyglots[locale];
    if (!polyglot) {
      // Cache the instance in `polyglots`.
      polyglots[locale] = polyglot = new Polyglot({
        locale: locale,
        phrases: require(moduleNamePrefix + locale)
      });
    }
    return function(key, options) {
      if (key == null) {
        // Called without arguments.
        return locale;
      }
      return polyglot.t(key, options);
    };
  };
};
