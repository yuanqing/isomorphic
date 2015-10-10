require('babel/register');
var fs = require('fs');
var path = require('path');
var React = require('react');
var express = require('express');
var compression = require('compression');
var connectRedis = require('connect-redis');
var serveFavicon = require('serve-favicon');
var lodashTemplate = require('lodash.template');
var expressSession = require('express-session');

var Store = require('../lib/store');
var RouteActionCreator = require('../lib/route-action-creator');

var config = require('../config');
var routes = require('./routes');
var reducers = require('./reducers');
var Controller = require('./Controller');
var componentLoader = require('./component-loader');

var ROOT_DIR = path.resolve(__dirname, '..');

// Read the template.
var tmpl = lodashTemplate(fs.readFileSync(ROOT_DIR + '/index.html', 'utf8'));

// Initialise.
var app = express();

// Disable an `Express` header.
app.disable('x-powered-by');

// Gzip.
app.use(compression());

// Serve favicon.
app.use(serveFavicon(ROOT_DIR + '/assets/favicon.ico'));

// Serve the `/assets`, `/css` and `/js` directories.
app.use('/assets', express.static(ROOT_DIR + '/assets'));
app.use('/css', express.static(ROOT_DIR + '/dist/css'));
app.use('/js', express.static(ROOT_DIR + '/dist/js'));

// Set up sessions.
var RedisStore = connectRedis(expressSession);
app.use(expressSession({
  name: 'sessionID',
  secret: 'development',
  cookie: {
    httpOnly: false
  },
  store: new RedisStore({
    host: config.redisHostname,
    port: config.redisPort
  }),
  resave: false,
  saveUninitialized: true
}));

var routeActionCreator = new RouteActionCreator(routes, {
  componentLoader: componentLoader
});

// Intercept all `get` requests.
app.get('*', function(req, res) {
  // Initialise a new Store for every new request.
  var store = new Store(reducers);
  // Pass in the empty `store` to the `route` method.
  store.dispatch(routeActionCreator.route(req.url, { store: store })).then(function() {
    var state = store.getState();
    // Check if there was an error or if we need to redirect.
    if (state.route.error) {
      res.status(404);
    } else {
      var redirectUrl = state.route.redirectUrl;
      if (redirectUrl) {
        res.status(301);
        return res.redirect(redirectUrl);
      }
    }
    var reactElement = React.createElement(Controller, {
      store: store,
      state: state
    });
    // Serialise the `state`, and interpolate it into our template.
    res.end(tmpl({
      app: React.renderToString(reactElement),
      state: JSON.stringify(state),
      viewName: state.route.viewName
    }));
  });
});

// Run the app.
app.listen(config.expressPort);
