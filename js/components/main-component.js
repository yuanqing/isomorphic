var React = require('react');

var IS_CLIENT = require('../../lib/globals').IS_CLIENT;
var HeaderPartial = require('./partials/header-component');
var FooterPartial = require('./partials/footer-component');
var Components = require('./');

module.exports = React.createClass({
  mixins: IS_CLIENT ? [require('../store').mixin] : [],
  getInitialState: function() {
    return this.props.state || {};
  },
  render: function() {
    var Component = Components[this.state.route.componentName];
    return (
      <div>
        <HeaderPartial />
        {this.state.route && this.state.route.isPending ? <div className="LoadingOverlay"></div> : null}
        <Component {...this.state} />
        <FooterPartial />
      </div>
    );
  }
});
