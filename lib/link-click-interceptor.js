var anchorElement = document.createElement('a');

module.exports = function(router) {

  // Intercept link clicks, and pass the link's `href` to the `router`.
  var onClick = function(event) {
    // Exit if the user had pressed the <Command> key or <Shift> key.
    if (event.metaKey || event.shiftKey) {
      return;
    }
    // Find the anchor element that was clicked.
    var element = event.target;
    while (element && element.nodeName !== 'A') {
      element = element.parentNode;
    }
    // Exit if `elem` does not have a `parentNode` or `href` attribute, or
    // if the `target` attribute was set but is not `_self`.
    if (!element || !element.href || (element.target && element.target !== '_self')) {
      return;
    }
    // `elem` is a valid anchor element, and so we intercept it.
    event.stopPropagation();
    event.preventDefault();
    // Strip out the domain name before navigating.
    anchorElement.href = element.href;
    router(anchorElement.pathname + anchorElement.search +
      anchorElement.hash);
  };
  document.addEventListener('click', onClick);

  // The below event fires when the user clicks the back/forward buttons, or
  // when we explicitly call window.history.back().
  var onPopstate = function() {
    // Set `isPopstate` to `true`.
    router(window.location.pathname, { isPopstate: true });
  };
  window.addEventListener('popstate', onPopstate);

  // Return a function for removing the events we had attached.
  return function() {
    document.removeEventListener('click', onClick);
    window.removeEventListener('popstate', onPopstate);
  };

};
