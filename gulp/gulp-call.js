'use strict'

var through = require('through2');

module.exports = function(flushCallback) {
  return flushCallback ? through.obj(function(data, encoding, callback) {
    callback(null, data);
  }, function(callback) {
    flushCallback();
    callback();
  }) : through.obj();
};
