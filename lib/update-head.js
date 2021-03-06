// Utility for updating the `<title>` and `<meta>` tags in the `<head>` when
// routing. Client-side only.

var savoy = require('savoy');

module.exports = function(options) {
  options = options || {};
  var metaAttribute = options.metaAttribute || 'data-app-meta';
  var clear = options.clear === false ? false : true;
  var metaSelector = 'meta[' + metaAttribute + ']';
  var updateHead = function(title, meta) {
    // Only update the title if it has changed.
    if (title && document.title !== title) {
      document.title = title;
    }
    if (clear) {
      // Remove all `meta` elements that match `metaSelector`
      savoy.each(document.querySelectorAll(metaSelector), function(metaElement) {
        metaElement.parentNode.removeChild(metaElement);
      });
    }
    if (meta) {
      // Create and append new `meta` elements to the `head`.
      var headElement = document.getElementsByTagName('head');
      savoy.each(meta, function(data) {
        var metaElement = document.createElement('meta');
        savoy.each(data, function(value, key) {
          metaElement.setAttribute(key, value);
        });
        metaElement.setAttribute(metaAttribute, 'true');
        headElement[0].appendChild(metaElement);
      });
    }
  };
  // Converts an object literal of key-value pairs into `meta` tags
  // (raw strings).
  updateHead.compileMeta = function(meta) {
    if (!meta) {
      return '';
    }
    return savoy.map(meta, function(data) {
      return '<meta' + savoy.fold(data, [], function(acc, value, key) {
        return acc + ' ' + key + '="' + value + '"';
      }) + ' ' + metaAttribute + '>';
    }).join('');
  };
  return updateHead;
};
