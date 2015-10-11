var ViewLoader = require('lib/view-loader');

module.exports = new ViewLoader({
  moduleNamePrefix: 'js/views/',
  baseUrl: '/',
  initialViewName: window.__STATE__.route.viewName
});
