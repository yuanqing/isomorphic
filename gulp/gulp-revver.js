'use strict';

var path = require('path');
var gutil = require('gulp-util');
var revHash = require('rev-hash');
var revPath = require('rev-path');
var through = require('through2');
var objectAssign = require('object-assign');

var identity = function(x) {
  return x;
};

var PLUGIN_NAME = 'gulp-revver';

module.exports = function(options) {
  options = options || {};
  var manifest = options.manifest || {};
  var filename = options.filename || 'manifest.json';
  var interpolateRegex = options.interpolateRegex || /{{\s*([^}]+?)\s*}}/g;
  var interpolateCallback = options.interpolateCallback || identity;
  var rev = function() {
    return through.obj(function(file, encoding, callback) {
      if (file.isStream()) {
        callback(new gutil.PluginError(PLUGIN_NAME, 'Streaming is not supported'));
        return;
      }
      var hash = revHash(file.contents);
      var initialPath = file.path;
      var revvedPath = file.path = revPath(file.path, hash);
      var temp = {};
      temp[path.relative(file.base, initialPath)] = path.relative(file.base, revvedPath);
      objectAssign(manifest, temp);
      callback(null, file);
    });
  };
  rev.manifest = function(options) {
    options = options || {};
    var clean = options.clean;
    return through.obj(function(file, encoding, callback) {
      callback(null, clean ? null : file);
    }, function(callback) {
      this.push(new gutil.File({
        path: process.cwd() + '/' + filename,
        contents: new Buffer(JSON.stringify(manifest))
      }));
      callback();
    });
    // return objectAssign({}, manifest);
  };
  rev.interpolate = function() {
    return through.obj(function(file, encoding, callback) {
      var contents = file.contents.toString().replace(interpolateRegex, function(match, originalPath) {
        var revvedPath = manifest[originalPath];
        if (!revvedPath) {
          return callback(new gutil.PluginError(PLUGIN_NAME, 'Revved asset not found'));
        }
        return interpolateCallback(revvedPath);
      });
      file.contents = new Buffer(contents);
      callback(null, file);
    });
  };
  return rev;
};
