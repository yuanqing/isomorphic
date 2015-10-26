var React = window.React = require('react');
var ReactDom = require('react-dom');

var linkClickInterceptor = require('lib/link-click-interceptor');

var store = require('js/store');
var firebase = require('js/firebase');
var RootComponent = require('js/root-component');
var routeActionCreator = require('js/action-creators/route-action-creator');
var storeActionCreator = require('js/action-creators/store-action-creator');

ReactDom.render(<RootComponent store={store} />,
  document.querySelector('.app'));

linkClickInterceptor(function(url, opts) {
  store.dispatch(routeActionCreator.route(url, opts));
});

// Connect to Firebase and listen to changes.
firebase.listen(function(data) {
  console.log('Synced from Firebase', data);
  store.dispatch(storeActionCreator.receiveProducts(data.products));
});

