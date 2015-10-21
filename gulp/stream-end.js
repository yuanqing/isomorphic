'use strict';

var through = require('through2');

module.exports = function(callback) {
  return callback ? through.obj(function(data, encoding, transformCallback) {
    transformCallback(null, data);
  }, function(flushCallback) {
    flushCallback();
    callback();
  }) : through.obj();
};
