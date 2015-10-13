var Header = require('./partials/header');
var Footer = require('./partials/footer');
var i18n = require('./i18n');

module.exports = require('lib/root-component')(i18n, {
  render: function() {
    var View = require('js/views/' + this.props.route.viewName);
    return (
      <div>
        <Header />
        <View {... this.props} />
        <Footer />
      </div>
    );
  }
});
