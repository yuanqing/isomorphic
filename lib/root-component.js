var React = require('react');

var component = require('./component');

// The root component; there should only be a single instance of this component
// in the app.
module.exports = function(translate, spec) {
  var Component = component(spec);
  return React.createClass({
    componentDidMount: function() {
      var self = this;
      self.props.store.setListener(function(state) {
        self.isMounted() && self.setState(state);
      });
    },
    componentWillUnmount: function() {
      this.props.store.unsetListener();
    },
    childContextTypes: {
      store: React.PropTypes.object,
      t: React.PropTypes.func.isRequired
    },
    getChildContext: function() {
      var store = this.props.store;
      return {
        store: store,
        t: translate(store.getState().locale)
      };
    },
    render: function() {
      return <Component {... this.props.store.getState()} />;
    }
  });
};
