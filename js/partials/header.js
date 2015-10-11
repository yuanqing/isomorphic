// var React = require('react');

// console.log(require('../../lib/components/component'));

module.exports = require('../../lib/components/component')({
  render: function() {
    return (
      <div className="Header">
        <ul className="Nav">
          <li><a href="/">Home</a></li>
          <li><a href="/help">Help</a> (Redirects to FAQ)</li>
          <li><a href="/stores/fairprice">Fairprice</a></li>
        </ul>
        <hr />
      </div>
    );
  }
});
