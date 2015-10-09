var React = require('react');

var linkInterceptor = require('../lib/link-interceptor');

var store = require('./store');
var firebase = require('./firebase');
var Controller = require('./controller');
var routeActionCreator = require('./action-creators/route-action-creator');
var storeActionCreator = require('./action-creators/store-action-creator');

React.render(<Controller state={window.__STATE__} />,
  document.querySelector('.app'));

linkInterceptor(function(url, opts) {
  store.dispatch(routeActionCreator.route(url, opts));
});

// Connect to Firebase and listen to changes.
firebase.listen(function(data) {
  console.log('Synced from Firebase:', data);
  store.dispatch(storeActionCreator.receiveProducts(data.products));
});
