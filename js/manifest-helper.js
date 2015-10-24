var path = require('path');
var savoy = require('savoy');

var helper = function(originalPathPrefix) {
  return function(manifest) {
    return savoy.fold(manifest, {}, function(acc, revvedPath, originalPath) {
      if (originalPath.indexOf(originalPathPrefix) === 0) {
        var key = path.basename(originalPath, '.js');
        var value = path.basename(revvedPath, '.js').substring(key.length + 1);
        acc[key] = value;
      }
      return acc;
    });
  };
};

module.exports = {
  getViewHashes: helper('js/views/'),
  getLocaleHashes: helper('locales/')
};
