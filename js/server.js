require('babel/register');
var fs = require('fs');
var path = require('path');
var React = require('react');
var config = require('config');
var express = require('express');
var compression = require('compression');
var connectRedis = require('connect-redis');
var serveFavicon = require('serve-favicon');
var lodashTemplate = require('lodash.template');
var expressSession = require('express-session');

var Store = require('../lib/store');
var RouteActionCreator = require('../lib/route-action-creator');

var routes = require('./routes');
var reducers = require('./reducers');
var MainComponent = require('./components/main-component');

var ROOT_DIR = path.resolve(__dirname, '..');

// Read the template.
var tmpl = lodashTemplate(fs.readFileSync(ROOT_DIR + '/index.html', 'utf8'));

// Initialise.
var app = express();

// Gzip.
app.use(compression());

// Serve favicon.
app.use(serveFavicon(ROOT_DIR + '/assets/favicon.ico'));

// Serve the `/dist` and `/assets` directories.
app.use('/dist', express.static(ROOT_DIR + '/dist'));
app.use('/assets', express.static(ROOT_DIR + '/assets'));

// Set up sessions.
var RedisStore = connectRedis(expressSession);
app.use(expressSession({
  name: 'sessionID',
  secret: 'development',
  cookie: {
    httpOnly: false
  },
  store: new RedisStore({
    host: 'localhost',
    port: 6379
  }),
  resave: false,
  saveUninitialized: true
}));

// Serialise the `state`, and interpolate it into our template.
app.get('*', function(req, res) {
  var store = new Store(reducers);
  var routeActionCreator = new RouteActionCreator(routes, store);
  store.dispatch(routeActionCreator.route(req.url)).then(function() {
    var state = store.getState();
    var redirectUrl = state.route.redirectUrl;
    if (redirectUrl) {
      res.status(301);
      return res.redirect(redirectUrl);
    }
    var reactElem = React.createElement(MainComponent, {
      store: store,
      state: state
    });
    res.end(tmpl({
      app: React.renderToString(reactElem),
      state: JSON.stringify(state)
    }));
  });
});

// Run the app.
app.listen(config.port);
