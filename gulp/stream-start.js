'use strict';

var through = require('through2');

module.exports = function(x) {
  var stream = through.obj(function(data, encoding, callback) {
    callback(null, data);
  }, function(callback) {
    if (Array.isArray(x)) {
      var i = -1;
      var length = x.length;
      while (++i < length) {
        this.push(x[i]);
      }
    } else {
      this.push(typeof x === 'function' ? x() : x);
    }
    callback();
  });
  process.nextTick(function() {
    stream.end();
  });
  return stream;
};
