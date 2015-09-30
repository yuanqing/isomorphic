var React = require('react');

var store = require('./store');
var firebase = require('./firebase');
var MainComponent = require('./components/main-component');
var StoreActionCreator = require('./action-creators/store-action-creator');

var mainComponent = React.render(<MainComponent state={window.__STATE__} />,
  document.querySelector('.__APP__'));
delete window.__STATE__;
var scriptElem = document.querySelector('.__STATE__');
scriptElem.parentNode.removeChild(scriptElem);

firebase.listen(function(data) {
  console.log('Synced from Firebase:', data);
  store.dispatch(StoreActionCreator.receiveProducts(data.products));
});

module.exports = mainComponent;
