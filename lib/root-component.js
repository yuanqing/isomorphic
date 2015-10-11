var React = require('react');

var i18n = require('./i18n');
var component = require('./component');

// The root component; there should only be a single instance of this component
// in the app.
module.exports = function(specification, options) {
  options = options || {};
  var moduleNamePrefix = options.moduleNamePrefix || '';
  var Component = component(specification);
  return React.createClass({
    childContextTypes: {
      t: React.PropTypes.func.isRequired
    },
    getChildContext: function() {
      var locale = this.props.state.locale;
      return {
        t: i18n(locale, require(moduleNamePrefix + locale))
      };
    },
    render: function() {
      return <Component {...this.props} />;
    }
  });
};
