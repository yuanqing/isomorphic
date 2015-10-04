var fold = require('savoy').fold;
var httpplease = require('httpplease');

var assign = require('./assign');
var promise = require('./promise');

// This is a light wrapper around `httpplease` (isomorphic `XMLHttpRequest`)
// where each method returns a promise.
module.exports = fold(['get', 'post', 'put', 'head', 'patch', 'delete'], {},
    function(acc, method) {
  acc[method] = function(url, options) {
    options = options || {};
    return promise(function(resolve, reject) {
      httpplease[method](assign({ url: url }, options), function(err, result) {
        return err ? reject(err) : resolve(options.raw ? result.text : JSON.parse(result.text));
      });
    });
  };
  return acc;
});
