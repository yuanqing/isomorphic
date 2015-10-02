var promise = require('./promise');
var httpplease = require('httpplease');

// This is a light wrapper around `httpplease` (isomorphic `XMLHttpRequest`)
// where each method returns a promise.
module.exports = {
  get: function(url) {
    return promise(function(resolve, reject) {
      httpplease.get(url, function(err, result) {
        return err ? reject(err) : resolve(JSON.parse(result.text));
      });
    });
  }
  // TODO: Add POST, PUT, DELETE.
};
