var React = require('react');
var RouteActionCreator = require('../action-creators/route-action-creator');

var store = require('../store');

module.exports = React.createClass({
  render: function() {
    return (
      <div className="Home">
        <h1>Home</h1>
        <button onClick={
          function() {
            store.dispatch(RouteActionCreator.route('/stores/fairprice'));
          }
        }>Trigger a route from within a Component</button>
      </div>
    );
  }
});
