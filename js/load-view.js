var loadView = require('lib/load-view');

module.exports = loadView({
  moduleNamePrefix: 'js/views/',
  baseUrl: '/',
  initialViewName: window.__STATE__.route.viewName
});
