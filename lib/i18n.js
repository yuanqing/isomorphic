var Polyglot = require('node-polyglot');

module.exports = function(locale, phrases) {
  var polyglot = new Polyglot({
    locale: locale,
    phrases: phrases
  });
  return function(key, smartCount) {
    return polyglot.t(key, smartCount);
  };
};
