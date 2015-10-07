var React = require('react');

var store = require('./store');
var firebase = require('./firebase');
var Controller = require('./Controller');

var storeActionCreator = require('./action-creators/store-action-creator');

React.render(<Controller state={window.__STATE__} />,
  document.querySelector('.app'));

// Connect to Firebase and listen to changes.
firebase.listen(function(data) {
  console.log('Synced from Firebase:', data);
  store.dispatch(storeActionCreator.receiveProducts(data.products));
});
