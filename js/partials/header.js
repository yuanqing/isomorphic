module.exports = require('lib/component')({
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
