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
      var locale = this.props.state.locale;
      return {
        t: i18n('en', process.browser ? require('locales/' + locale) : require('../locales/' + locale))
      };
    },
    render: function() {
      return <Component {...this.props} />;
    }
  });
};
