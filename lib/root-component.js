var React = require('react');
var component = require('./component');
var i18n = require('./i18n');

// Only one instance of this component.
module.exports = function(specification) {
  var Component = component(specification);
  return React.createClass({
    childContextTypes: {
      t: React.PropTypes.func.isRequired
    },
    getChildContext: function() {
      return {
        t: i18n('en', require('locales/' + this.props.state.locale))
      };
    },
    render: function() {
      return <Component {...this.props} />;
    }
  });
};
