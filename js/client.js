var React = require('react');

var store = require('./store');
var firebase = require('./firebase');
var Controller = require('./Controller');

var storeActionCreator = require('./action-creators/store-action-creator');
var routeActionCreator = require('./action-creators/route-action-creator');

React.render(<Controller state={window.__STATE__} />,
  document.querySelector('.__APP__'));

// Connect to Firebase and listen to changes.
firebase.listen(function(data) {
  console.log('Synced from Firebase:', data);
  store.dispatch(storeActionCreator.receiveProducts(data.products));
});

// Intercept link clicks, and pass the link's `href` to the router.
var anchorElement = document.createElement('a');
document.addEventListener('click', function(e) {
  // Exit if the user had pressed the <Command> key or <Shift> key.
  if (e.metaKey || e.shiftKey) {
    return;
  }
  // Find the anchor element that was clicked.
  var element = e.target;
  while (element && element.nodeName !== 'A') {
    element = element.parentNode;
  }
  // Exit if `elem` does not have a `parentNode` or `href` attribute, or
  // if the `target` attribute was set but is not `_self`.
  if (!element || !element.href || (element.target && element.target !== '_self')) {
    return;
  }
  // `elem` is a valid anchor element, and so we intercept it.
  e.stopPropagation();
  e.preventDefault();
  // Strip out the domain name before navigating.
  anchorElement.href = element.href;
  store.dispatch(routeActionCreator.route(anchorElement.pathname + anchorElement.search
    + anchorElement.hash));
});

// The below event fires when the user clicks the back/forward buttons, or
// when we explicitly call window.history.back().
window.addEventListener('popstate', function() {
  // Set `isPopstate` to `true`.
  store.dispatch(routeActionCreator.route(window.location.pathname, { isPopstate: true }));
});
