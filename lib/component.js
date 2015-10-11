var React = require('react');

module.exports = function(spec) {
  spec.t = function(key, smartCount) {
    return this.context.t(key, smartCount);
  };
  spec.contextTypes = {
    t: React.PropTypes.func.isRequired
  };
  return React.createClass(spec);
};
