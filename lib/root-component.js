var React = require('react');

var component = require('./component');

// The root component; there should only be a single instance of this component
// in the app.
module.exports = function(i18n, spec) {
  var Component = component(spec);
  return React.createClass({
    componentDidMount: function() {
      var self = this;
      var store = self.props.store;
      self.listener = function(state) {
        self.isMounted() && self.setState(state);
      };
      store.addListener(self.listener);
    },
    componentWillUnmount: function() {
      this.props.store.removeListener(this.listener);
    },
    childContextTypes: {
      store: React.PropTypes.object,
      t: React.PropTypes.func.isRequired
    },
    getChildContext: function() {
      var store = this.props.store;
      return {
        store: store,
        t: i18n(store.getState().locale)
      };
    },
    render: function() {
      return <Component {... this.props.store.getState()} />;
    }
  });
};
