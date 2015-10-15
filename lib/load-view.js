// Utility for loading views dynamically. Keeps track of the views that were
// already loaded, and only loads each view once. Client-side only.

var loadScript = require('scriptjs');

module.exports = function(options) {
  options = options || {};
  // The module name of the view is `viewName` prefixed
  // with `moduleNamePrefix`.
  var moduleNamePrefix = options.moduleNamePrefix;
  // `baseUrl` is the URL where we serving our views from.
  var baseUrl = options.baseUrl;
  // Track the `moduleName` of the views we've already loaded.
  var loadedModuleIds = {};
  var initialViewName = options.initialViewName;
  if (initialViewName) {
    loadedModuleIds[moduleNamePrefix + initialViewName] = true;
  }
  return function(viewName, callback) {
    var moduleName = moduleNamePrefix + viewName;
    // If we've already loaded the view, exit.
    if (loadedModuleIds[moduleName]) {
      return callback();
    }
    // Otherwise, load it asynchronously, and update `loadedModuleIds`.
    loadScript(baseUrl + moduleName + '.js', function() {
      loadedModuleIds[moduleName] = true;
      callback();
    }, callback);
  };
};
