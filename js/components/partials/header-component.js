var React = require('react');

module.exports = React.createClass({
  render: function() {
    return (
      <div className="Header">
        <ul className="Nav">
          <li><a href="/">Home</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li><a href="/help">Help</a> (Redirects to FAQ)</li>
          <li><a href="/stores/fairprice">Fairprice</a></li>
        </ul>
        <hr />
      </div>
    );
  }
});
