var IS_CLIENT = require('../lib/is-client');
var ViewLoader = require('../lib/view-loader');

module.exports = new ViewLoader({
  basePath: __dirname,
  baseUrl: '/js',
  moduleIdPrefix: 'views',
  initialViewName: IS_CLIENT ? window.__STATE__.route.viewName : null
});
