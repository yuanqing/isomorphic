// Compiles each object literal of key-value pairs into a `meta` tag
// (raw string).

var savoy = require('savoy');

module.exports = function(metaAttributeName) {
  return function(meta) {
    return savoy.map(meta, function(data) {
      return '<meta' + savoy.fold(data, [], function(acc, value, key) {
        return acc + ' ' + key + '="' + value + '"';
      }) + ' ' + metaAttributeName + '>';
    }).join('');
  };
};
