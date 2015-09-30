var Firebase = require('firebase');
var promise = require('./promise');

// This is a light wrapper around the `firebase` npm module.
var FirebaseWrapper = module.exports = function(firebaseUrl) {
  this.firebase = new Firebase(firebaseUrl);
};

FirebaseWrapper.prototype = {

  // Get the value corresponding to the specified `path` in our Firebase.
  // Returns a promise.
  get: function(path) {
    var firebase = this.firebase;
    return promise(function(resolve, reject) {
      firebase.child(path || '/').once('value', function(dataSnapshot) {
        resolve(dataSnapshot.val());
      }, reject);
    });
  },

  // Update the value at the specified `path`. Returns a promise.
  update: function(path, value) {
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

  // Listen for changes. If there was an error, calls the given `callback`
  // with the error. Else calls the `callback` with the new state.
  listen: function(callback) {
    this.firebase.on('value', function(dataSnapshot) {
      callback(null, dataSnapshot.val());
    }, callback);
  }

};
