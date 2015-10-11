var Polyglot = require('node-polyglot');

module.exports = function(locale, phrases) {
  var polyglot = new Polyglot({
    locale: locale,
    phrases: phrases
  });
  return function() {
    return polyglot.t(x);
  };
};
