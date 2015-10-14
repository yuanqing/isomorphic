var React = require('react');
var assign = require('lib/assign');

// Child component.
module.exports = function(spec) {
  return React.createClass(assign(spec, {
    contextTypes: {
      store: React.PropTypes.object,
      t: React.PropTypes.func.isRequired
    },
    // Copy the methods of `this.context.store` to the component itself.
    getState: function() {
      return this.context.store.getState();
    },
    dispatch: function() {
      var store = this.context.store;
      return store.dispatch.apply(store, arguments);
    },
    // Allow `this.t('foo')` instead of `this.context.t('foo')`.
    t: function(key, options) {
      return this.context.t(key, options);
    }
  }));
};
