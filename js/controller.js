var React = require('react');
var IS_CLIENT = require('../lib/is-client');
var Header = require('./partials/header');
var Footer = require('./partials/footer');

module.exports = React.createClass({
  mixins: IS_CLIENT ? [require('./store').mixin] : [],
  getInitialState: function() {
    return this.props.state || {};
  },
  render: function() {
    var View = this.state.route.component || require('views/' + this.state.route.viewName);
    return (
      <div>
        <Header />
        <View {...this.state} />
        <Footer />
      </div>
    );
  }
});
