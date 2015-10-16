require('babel/register');

var fs = require('fs');
var path = require('path');
var savoy = require('savoy');
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
var compileMeta = require('./update-head').compileMeta;

var config = require('../config');
var reducers = require('./reducers');
var RootComponent = require('./root-component');
var RouteActionCreator = require('./action-creators/route-action-creator');
var LocaleActionCreator = require('lib/action-creators/locale-action-creator');

var ROOT_DIR = path.resolve(__dirname, '..');

var tmpl = lodashTemplate(fs.readFileSync(ROOT_DIR + '/dist/index.html', 'utf8'));
var supportedLanguages = ['en'];

var app = express();
app.disable('x-powered-by');
app.use(compression());
app.use(serveFavicon(ROOT_DIR + '/assets/favicon.ico'));
app.use('/assets', express.static(ROOT_DIR + '/assets'));
savoy.each(['css', 'js', 'locales'], function(dir) {
  app.use('/' + dir, express.static(ROOT_DIR + '/dist/' + dir));
});

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

app.get('*', function(request, response) {
  // Initialise a new Store for every new request.
  var store = new Store(reducers);
  // Determine the requested language.
  var negotiator = new Negotiator(request);
  var language = negotiator.language(supportedLanguages);
  var locale = language + '-sg';
  locale = 'en-sg'; // FIXME: Hard-code the locale for now.
  // Set the `locale` before we populate the `store`.
  store.dispatch(LocaleActionCreator.setLocale(locale));
  // Pass in the `store` to the `route` method.
  store.dispatch(RouteActionCreator.route(request.url, { store: store })).then(function() {
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
    var meta = compileMeta(state.route.meta);
    delete state.route.meta;
    var reactElement = React.createElement(RootComponent, {
      store: store
    });
    response.end(tmpl({
      title: state.route.title,
      meta: meta,
      state: JSON.stringify(state),
      locale: state.locale,
      viewName: state.route.viewName,
      app: ReactDOMServer.renderToString(reactElement)
    }));
  });
});

app.listen(config.expressPort);
