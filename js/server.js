require('babel/register');

var fs = require('fs');
var path = require('path');
var React = global.React = require('react');
var express = require('express');
var Negotiator = require('negotiator');
var compression = require('compression');
var connectRedis = require('connect-redis');
var serveFavicon = require('serve-favicon');
var expressSession = require('express-session');
var lodashTemplate = require('lodash.template');
var ReactDOMServer = require('react-dom/server');

var Store = require('lib/store');
var RouteActionCreator = require('lib/action-creators/route-action-creator');
var LocaleActionCreator = require('lib/action-creators/locale-action-creator');

var config = require('../config');
var routes = require('./routes');
var reducers = require('./reducers');
var RootComponent = require('./root-component');

var ROOT_DIR = path.resolve(__dirname, '..');

// Read the template.
var tmpl = lodashTemplate(fs.readFileSync(ROOT_DIR + '/index.html', 'utf8'));

// i18n.
var supportedLanguages = ['en'];

// Initialise.
var app = express();

// Remove the `x-powered-by` header.
app.disable('x-powered-by');

// Gzip.
app.use(compression());

// Serve favicon.
app.use(serveFavicon(ROOT_DIR + '/assets/favicon.ico'));

// Serve the `/assets`, `/css` and `/js` directories.
app.use('/assets', express.static(ROOT_DIR + '/assets'));
app.use('/css', express.static(ROOT_DIR + '/dist/css'));
app.use('/js', express.static(ROOT_DIR + '/dist/js'));
app.use('/locales', express.static(ROOT_DIR + '/dist/locales'));

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

var routeActionCreator = new RouteActionCreator(routes);

// Intercept all `get` requests.
app.get('*', function(request, response) {
  // Initialise a new Store for every new request.
  var store = new Store(reducers);
  // Determine the requested language.
  var negotiator = new Negotiator(request);
  var language = negotiator.language(supportedLanguages);
  var locale = language + '-sg';
  locale = 'en-sg';
  // Set the `locale` before we populate our `store`.
  store.dispatch(LocaleActionCreator.setLocale(locale));
  // Pass in the empty `store` to the `route` method.
  store.dispatch(routeActionCreator.route(request.url, { store: store })).then(function() {
    var state = store.getState();
    // Check if there was an error or if we need to redirect.
    if (state.route.error) {
      response.status(404);
    } else {
      var redirectUrl = state.route.redirectUrl;
      if (redirectUrl) {
        response.status(301);
        return response.redirect(redirectUrl);
      }
    }
    var reactElement = React.createElement(RootComponent, {
      store: store,
      state: state
    });
    // Serialise the `state`, and interpolate it into our template.
    response.end(tmpl({
      app: ReactDOMServer.renderToString(reactElement),
      state: JSON.stringify(state),
      viewName: state.route.viewName,
      locale: state.locale
    }));
  });
});

// Run the app.
app.listen(config.expressPort);
