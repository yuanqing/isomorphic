var promise = require('./promise');
var httpplease = require('httpplease');

module.exports = {
  get: function(url) {
    return promise(function(resolve, reject) {
      httpplease.get(url, function(err, result) {
        if (err) {
          return reject(err);
        }
        resolve(JSON.parse(result.text));
      });
    });
  }
};
