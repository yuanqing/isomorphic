var loadScript = require('scriptjs');

module.exports = function(moduleIdPrefix, options) {
  options = options || {};
  // `baseUrl` is the URL where we serving our views from.
  var baseUrl = options.baseUrl;
  // Track the `moduleId` of the views we've already loaded.
  var loadedModuleIds = {};
  var initialViewName = options.initialViewName;
  if (initialViewName) {
    loadedModuleIds[moduleIdPrefix + '/' + initialViewName] = true;
  }
  return function(viewName, callback) {
    var moduleId = moduleIdPrefix + '/' + viewName;
    // Check if we've already loaded the module. If yes, exit.
    if (loadedModuleIds[moduleId]) {
      return callback();
    }
    // Otherwise, load it asynchronously, and update the
    // `loadedModuleIds` hash.
    loadScript(baseUrl + moduleId + '.js', function() {
      loadedModuleIds[moduleId] = true;
      callback();
    }, callback);
  };
};
