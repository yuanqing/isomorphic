var React = require('react');

var linkClickInterceptor = require('../lib/link-click-interceptor');

var store = require('./store');
var firebase = require('./firebase');
var MainComponent = require('./main');
var routeActionCreator = require('./action-creators/route-action-creator');
var storeActionCreator = require('./action-creators/store-action-creator');

React.render(<MainComponent state={window.__STATE__} />,
  document.querySelector('.app'));

linkClickInterceptor(function(url, opts) {
  store.dispatch(routeActionCreator.route(url, opts));
});

// Connect to Firebase and listen to changes.
firebase.listen(function(data) {
  console.log('Synced from Firebase:', data);
  store.dispatch(storeActionCreator.receiveProducts(data.products));
});
