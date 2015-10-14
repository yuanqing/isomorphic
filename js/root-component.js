var Header = require('js/partials/header');
var Footer = require('js/partials/footer');

module.exports = require('lib/root-component')(require('js/translate'), {
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
