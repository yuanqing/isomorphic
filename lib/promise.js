// `setImmediate` is used by the `promiscuous` module; see
// https://github.com/RubenVerborgh/promiscuous/issues/21
require('setimmediate.js');

var fold = require('savoy').fold;
var promiscuous = require('promiscuous');

var all = promiscuous.all;

// Monkey patch `promiscuous.all` to allow the `promises` argument to be
// an object.
promiscuous.all = function(promises) {
  if (Array.isArray(promises)) {
    return all(promises);
  }
  var keys = [];
  var promises = fold(promises, [], function(acc, promise, key) {
    keys.push(key);
    acc.push(promise);
    return acc;
  });
  return all(promises).then(function(results) {
    return fold(results, {}, function(acc, result, index) {
      acc[keys[index]] = result;
      return acc;
    });
  });
};

module.exports = promiscuous;
