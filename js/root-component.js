var Header = require('./partials/header');
var Footer = require('./partials/footer');

module.exports = require('lib/root-component')({
  mixins: process.browser ? [require('./store').mixin] : [],
  getInitialState: function() {
    return this.props.state || {};
  },
  render: function() {
    var View = require('js/views/' + this.state.route.viewName);
    return (
      <div>
        <Header />
        <View {...this.state} />
        <Footer />
      </div>
    );
  }
}, {
  moduleNamePrefix: 'locales/'
});
