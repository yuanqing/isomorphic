var store = require('js/store');
var RouteActionCreator = require('js/action-creators/route-action-creator');

module.exports = require('lib/component')({
  render: function() {
    return (
      <div className="Home">
        <h1>{this.t('hello')}</h1>
        <button onClick={
          function() {
            store.dispatch(RouteActionCreator.route('/stores/fairprice'));
          }
        }>Trigger a route from within a Component</button>
      </div>
    );
  }
});
