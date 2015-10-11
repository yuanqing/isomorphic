var React = require('react');

// Child component.
module.exports = function(spec) {
  spec.contextTypes = {
    t: React.PropTypes.func.isRequired
  };
  spec.t = function(key, smartCount) {
    // So that we can do `{this.t('foo')}` in `render`.
    return this.context.t(key, smartCount);
  };
  return React.createClass(spec);
};
