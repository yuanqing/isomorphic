var React = require('react');
var RouteActionCreator = require('../action-creators/route-action-creator');

var store = require('../store');

// var childComponent = function(spec) {
//   spec.__ = function(key) {
//     return this.context.locale;
//   };
//   spec.contextTypes = {
//     locale: React.PropTypes.string.isRequired
//   };
//   return React.createClass(spec);
// };

module.exports = React.createClass({
  render: function() {
    return (
      <div className="Home">
        <h1>Hello</h1>
        <button onClick={
          function() {
            store.dispatch(RouteActionCreator.route('/stores/fairprice'));
          }
        }>Trigger a route from within a Component</button>
      </div>
    );
  }
});
