var Firebase = require('../lib/firebase');
var config = require('../config');

module.exports = new Firebase(config.firebaseUrl);
