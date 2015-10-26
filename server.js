require('babel/register');

var fs = require('fs');
var omit = require('lodash.omit');
var savoy = require('savoy');
var React = global.React = require('react');
var Revver = require('revver');
var express = require('express');
var Negotiator = require('negotiator');
var compression = require('compression');
var connectRedis = require('connect-redis');
var serveFavicon = require('serve-favicon');
var expressSession = require('express-session');
var lodashTemplate = require('lodash.template');
var ReactDOMServer = require('react-dom/server');

var config = require('./config');

var Store = require('lib/store');

var reducers = require('js/reducers');
var updateHead = require('js/update-head');
var RootComponent = require('js/root-component');
var RouteActionCreator = require('js/action-creators/route-action-creator');
var LocaleActionCreator = require('lib/action-creators/locale-action-creator');

var BUILD_DIR = './build';

var tmpl = lodashTemplate(fs.readFileSync(BUILD_DIR + '/index.html', 'utf8'));
var supportedLanguages = ['en'];

var app = express();
app.disable('x-powered-by');
app.use(compression());
app.use(serveFavicon('./assets/favicon.ico'));
savoy.each(['css', 'images', 'js', 'locales'], function(dir) {
  app.use('/' + dir, express.static(BUILD_DIR + '/' + dir));
});

var revver = new Revver({
  manifest: require(BUILD_DIR + '/manifest.json')
});
var viewHashes = revver.getHashes({ prefix: 'js/views/' });
var localeHashes = revver.getHashes({ prefix: 'locales/' });

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
    var meta = updateHead.compileMeta(state.route.meta);
    omit(state.route, 'meta');
    var reactElement = React.createElement(RootComponent, {
      store: store
    });
    var viewName = state.route.viewName;
    var localeName = state.locale;
    response.end(tmpl({
      title: state.route.title,
      meta: meta,
      state: JSON.stringify(state),
      localeName: localeName + '-' + localeHashes[localeName],
      viewName: viewName + '-' + viewHashes[viewName],
      app: ReactDOMServer.renderToString(reactElement)
    }));
  });
});

app.listen(config.expressPort);
