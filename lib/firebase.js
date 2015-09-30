var Firebase = require('firebase');
var promise = require('./promise');
var noop = function() {};

// This is a light wrapper around the `firebase` npm module.
var FirebaseWrapper = module.exports = function(firebaseUrl) {
  this.firebase = new Firebase(firebaseUrl);
};

FirebaseWrapper.prototype = {

  // Get the value at `path`. Returns a promise.
  get: function(path) {
    var firebase = this.firebase;
    return promise(function(resolve, reject) {
      firebase.child(path || '/').once('value', function(dataSnapshot) {
        resolve(dataSnapshot.val());
      }, reject);
    });
  },

  // Set the value at `path` to `value`. Returns a promise.
  set: function(path, value) {
    var firebase = this.firebase;
    return promise(function(resolve, reject) {
      firebase.child(path || '/').update(value, function(error) {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  },

  // Listen for changes. If we lose permission to read the data, calls the
  // `cancelCallback` with an error. Else calls the `successCallback` with
  // the new data.
  listen: function(successCallback, errorCallback) {
    this.firebase.on('value', function(dataSnapshot) {
      successCallback(dataSnapshot.val());
    }, errorCallback || noop);
  }

};
