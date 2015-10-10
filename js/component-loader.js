var ComponentLoader = require('../lib/component-loader');

module.exports = new ComponentLoader('views', {
  basePath: __dirname,
  baseUrl: '/js',
  initialViewName: require('../lib/is-client') ? window.__STATE__.route.viewName : null
});
