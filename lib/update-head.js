var each = require('savoy').each;

module.exports = function(attributeName) {

  var selector = 'meta[' + attributeName + ']';
  var head = document.getElementsByTagName('head');

  return function(title, meta) {

    // Update the title if needed.
    if (title !== document.title) {
      document.title = title;
    }

    if (meta) {
      // Remove all `meta` elements.
      each(document.querySelectorAll(selector), function(metaElement) {
        metaElement.parentNode.removeChild(metaElement);
      });
      // Add new `meta` elements
      each(meta, function(metaData) {
        var metaElement = document.createElement('meta');
        each(metaData, function(value, key) {
          metaElement.setAttribute(key, value);
        });
        metaElement.setAttribute(attributeName, 'true');
        head[0].appendChild(metaElement);
      });
    }

  };

};
