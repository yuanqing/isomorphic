// Utility for updating the `<title>` and `<meta>` tags in the `<head>` when
// routing. Client-side only.

var each = require('savoy').each;

module.exports = function(metaAttributeName) {
  var headElement = document.getElementsByTagName('head');
  var metaSelector = 'meta[' + metaAttributeName + ']';
  return function(title, meta) {
    // Only update the title if it has changed.
    if (document.title !== title) {
      document.title = title;
    }
    if (meta) {
      // Remove all `meta` elements that match `metaSelector`
      each(document.querySelectorAll(metaSelector), function(metaElement) {
        metaElement.parentNode.removeChild(metaElement);
      });
      // Create and append new `meta` elements to the `head`.
      each(meta, function(data) {
        var metaElement = document.createElement('meta');
        each(data, function(value, key) {
          metaElement.setAttribute(key, value);
        });
        metaElement.setAttribute(metaAttributeName, 'true');
        headElement[0].appendChild(metaElement);
      });
    }
  };
};
