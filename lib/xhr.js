var promise = require('./promise');
var httpplease = require('httpplease');

// RESTful verbs.
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
