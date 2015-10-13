var React = require('react');

// Child component.
module.exports = function(spec) {
  spec.contextTypes = {
    store: React.PropTypes.object,
    t: React.PropTypes.func.isRequired
  };
  // Copy the methods of `this.context.store` to the component itself.
  spec.getState = function() {
    return this.context.store.getState();
  };
  spec.dispatch = function() {
    var store = this.context.store;
    return store.dispatch.call(store, arguments);
  };
  // This is so that we can do `this.t('foo')` instead
  // of `this.context.t('foo')`.
  spec.t = function(key, smartCount) {
    return this.context.t(key, smartCount);
  };
  return React.createClass(spec);
};
