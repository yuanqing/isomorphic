var loadView = require('lib/load-view');

module.exports = loadView({
  moduleNamePrefix: 'js/views/',
  baseUrl: '/',
  manifest: window.__MANIFEST__,
  initialViewName: window.__STATE__.route.viewName
});
