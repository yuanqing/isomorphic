var RouteActionCreator = require('js/action-creators/route-action-creator');

module.exports = require('lib/component')({
  render: function() {
    var self = this;
    return (
      <div className="Home">
        <h1>{this.t('hello')}</h1>
        <button onClick={
          function() {
            self.dispatch(RouteActionCreator.route('/stores/fairprice'));
          }
        }>Trigger a route from within a Component</button>
      </div>
    );
  }
});
