var ComponentLoader = require('lib/component-loader');

module.exports = new ComponentLoader('js/views', {
  baseUrl: '/',
  initialViewName: window.__STATE__.route.viewName
});
