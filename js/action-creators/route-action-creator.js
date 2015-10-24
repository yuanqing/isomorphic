var options = {
  translate: require('js/translate')
};

if (process.browser) {
  options.store = require('js/store');
  options.loadView = require('lib/load-view')({
    moduleNamePrefix: 'js/views/',
    baseUrl: '/',
    manifest: window.__MANIFEST__,
    initialViewName: window.__STATE__.route.viewName
  });
  options.updateHead = require('js/update-head');
}

var RouteActionCreator = require('lib/action-creators/route-action-creator');
module.exports = new RouteActionCreator(require('js/routes'), options);
