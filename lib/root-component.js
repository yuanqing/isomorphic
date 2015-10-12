var React = require('react');

var component = require('./component');

// The root component; there should only be a single instance of this component
// in the app.
module.exports = function(i18n, specification) {
  var Component = component(specification);
  return React.createClass({
    childContextTypes: {
      t: React.PropTypes.func.isRequired
    },
    getChildContext: function() {
      return {
        t: i18n(this.props.state.locale)
      };
    },
    render: function() {
      return <Component {...this.props} />;
    }
  });
};
