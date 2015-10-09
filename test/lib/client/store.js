var React = require('react');
var test = require('tape');
var Store = require('../../../lib/store');

test('pass the Store `mixin` to a React component', function(t) {
  t.plan(9);
  var reducer = function(action, state, assign) {
    t.looseEqual(action, { type: 'bar' });
    t.looseEqual(state, { foo: 1 });
    return assign(state, {
      foo: 2
    });
  };
  var initialState = {
    foo: 1
  };
  var store = new Store(reducer, initialState);
  var renderedStates = [];
  var Component = React.createClass({
    mixins: [store.mixin],
    getInitialState: function() {
      return this.props.state || {};
    },
    render: function() {
      renderedStates.push(this.state);
      return null;
    }
  });
  t.equal(store.listeners.length, 0);
  t.looseEqual(renderedStates, []);
  // Create fixture
  var fixture = document.createElement('div');
  document.body.appendChild(fixture);
  React.render(<Component state={store.getState()} />, fixture);
  t.equal(store.listeners.length, 1);
  t.looseEqual(renderedStates, [
    { foo: 1 }
  ]);
  store.dispatch({ type: 'bar' });
  t.equal(store.listeners.length, 1);
  t.looseEqual(renderedStates, [
    { foo: 1 },
    { foo: 2 }
  ]);
  React.unmountComponentAtNode(fixture);
  t.equal(store.listeners.length, 0);
});
