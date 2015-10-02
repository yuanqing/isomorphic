var React = require('react');
var bulkRequire = require('bulk-require');

var IS_CLIENT = require('../lib/globals').IS_CLIENT;
var Header = require('./partials/header');
var Footer = require('./partials/footer');
var containers = bulkRequire(__dirname + '/containers', ['*.js']);

module.exports = React.createClass({
  mixins: IS_CLIENT ? [require('./store').mixin] : [],
  getInitialState: function() {
    return this.props.state || {};
  },
  render: function() {
    var Container = containers[this.state.route.componentName];
    return (
      <div>
        <Header />
        {this.state.route && this.state.route.isPending ? <div className="LoadingOverlay"></div> : null}
        <Container {...this.state} />
        <Footer />
      </div>
    );
  }
});
