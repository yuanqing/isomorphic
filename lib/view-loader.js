var promise = require('./promise');
var IS_CLIENT = require('./is-client');
var loadScript = IS_CLIENT ? require('scriptjs') : {};

var ViewLoader = module.exports = function(options) {
  options = options || {};
  this.moduleIdPrefix = options.moduleIdPrefix;
  if (IS_CLIENT) {
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

ViewLoader.prototype.load = function(viewName) {
  var self = this;
  return promise(function(resolve, reject) {
    var moduleId = self.moduleIdPrefix + '/' + viewName;
    // On the server-side, just `require` the module from the file system.
    if (!IS_CLIENT) {
      try {
        resolve(require(self.basePath + '/' + moduleId));
      } catch(error) {
        reject(error);
      }
      return;
    }
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
  });
};
