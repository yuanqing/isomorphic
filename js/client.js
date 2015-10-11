var React = window.React = require('react');
var ReactDom = require('react-dom');

var linkClickInterceptor = require('lib/link-click-interceptor');

var store = require('./store');
var firebase = require('./firebase');
var RootComponent = require('./root-component');
var routeActionCreator = require('./action-creators/route-action-creator');
var storeActionCreator = require('./action-creators/store-action-creator');

ReactDom.render(<RootComponent state={store.getState()} />,
  document.querySelector('.app'));

linkClickInterceptor(function(url, opts) {
  store.dispatch(routeActionCreator.route(url, opts));
});

// Connect to Firebase and listen to changes.
firebase.listen(function(data) {
  console.log('Synced from Firebase:', data);
  store.dispatch(storeActionCreator.receiveProducts(data.products));
});
