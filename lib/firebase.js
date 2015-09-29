var Firebase = require('firebase');

var promise = require('./promise');

var FirebaseWrapper = module.exports = function(firebaseUrl) {
  this.firebase = new Firebase(firebaseUrl);
};

FirebaseWrapper.prototype.get = function(path) {
  var firebase = this.firebase;
  return promise(function(resolve, reject) {
    firebase.child(path || '/').once('value', function(dataSnapshot) {
      resolve(dataSnapshot.val());
    }, reject);
  });
};

FirebaseWrapper.prototype.update = function(path, obj) {
  var firebase = this.firebase;
  return promise(function(resolve, reject) {
    firebase.child(path || '/').update(obj, function(err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

FirebaseWrapper.prototype.listen = function(callback) {
  this.firebase.on('value', function(dataSnapshot) {
    callback(null, dataSnapshot.val());
  }, callback);
};
