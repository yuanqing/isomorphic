// `setImmediate` is used by the `promiscuous` module; see
// https://github.com/RubenVerborgh/promiscuous/issues/21. The following
// polyfills it with `setTimeout` if necessary.
require('setimmediate.js');

var fold = require('savoy').fold;
var promiscuous = require('promiscuous');

var all = promiscuous.all;

// Monkey patch `promiscuous.all` to allow the `promises` argument to be
// an object.
promiscuous.all = function(promises) {
  // If already an array, just call the original `promiscuous.all`.
  if (Array.isArray(promises)) {
    return all(promises);
  }
  // Otherwise, accumulate the keys and values of the given object into
  // the `keys` and `promisesArray` arrays respectively.
  var keys = [];
  var promisesArray = fold(promises, [], function(acc, promise, key) {
    keys.push(key);
    acc.push(promise);
    return acc;
  });
  return all(promisesArray).then(function(results) {
    // If no error had occurred, reorganise the results (an array) into an
    // object, using keys from the `keys` array.
    return fold(results, {}, function(acc, result, index) {
      acc[keys[index]] = result;
      return acc;
    });
  });
};

module.exports = promiscuous;
