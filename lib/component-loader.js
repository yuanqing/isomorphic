var promise = require('./promise');
var loadScript = process.browser ? require('scriptjs') : null;

var ComponentLoader = module.exports = function(moduleIdPrefix, options) {
  options = options || {};
  this.moduleIdPrefix = moduleIdPrefix;
  if (process.browser) {
    // `baseUrl` is the URL where we serving our views from.
    this.baseUrl = options.baseUrl;
    // Track the `moduleId` of the views we've already loaded.
    this.loadedModuleIds = {};
    var initialViewName = options.initialViewName;
    if (initialViewName) {
      this.loadedModuleIds[this.moduleIdPrefix + '/' + initialViewName] = true;
    }
  } else {
    // `basePath` is the file system path to our view files.
    this.basePath = options.basePath;
  }
};

ComponentLoader.prototype.load = function(viewName) {
  var self = this;
  var moduleId = self.moduleIdPrefix + '/' + viewName;
  return promise(function(resolve, reject) {
    if (process.browser) {
      // On the client-side, check if we've already loaded the module. If yes,
      // `require` it.
      if (self.loadedModuleIds[moduleId]) {
        return resolve(require(moduleId));
      }
      // Otherwise, load it asynchronously, and update the
      // `loadedModuleIds` hash.
      loadScript(self.baseUrl + '/' + moduleId + '.js', function() {
        self.loadedModuleIds[moduleId] = true;
        try {
          resolve(require(moduleId));
        } catch(error) {
          reject(error);
        }
      }, reject);
    } else {
      // On the server-side, just `require` the module from the file system.
      try {
        resolve(require(self.basePath + '/' + moduleId));
      } catch(error) {
        reject(error);
      }
    }
  });
};
