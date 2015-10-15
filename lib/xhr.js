// A wrapper around `httpplease` (module for isomorphic `XMLHttpRequest`),
// where each RESTful method returns a promise.

var fold = require('savoy').fold;
var assign = require('./assign');
var promise = require('./promise');
var httpplease = require('httpplease');

module.exports = fold(['get', 'post', 'put', 'head', 'patch', 'delete'], {},
    function(acc, method) {
  acc[method] = function(url, options) {
    options = assign(options, {
      url: url
    });
    return promise(function(resolve, reject) {
      httpplease[method](options, function(err, result) {
        return err ? reject(err) : resolve(options.raw ? result.text : JSON.parse(result.text));
      });
    });
  };
  return acc;
});
