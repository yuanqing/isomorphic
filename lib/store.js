var assign = require('./assign');
var promise = require('./promise');

var noop = function() {};

var Store = module.exports = function(reducer, initialState) {
  var self = this;
  self.reducer = reducer;
  self.state = initialState || {};
  self.listener = noop;
};

Store.prototype = {
  setListener: function(listener) {
    this.listener = listener;
  },
  unsetListener: function() {
    this.listener = noop;
  },
  getState: function() {
    return this.state;
  },
  dispatch: function(action, callback) {
    var self = this;
    callback = callback || noop;
    // Synchronous `action`.
    if (action.type) {
      self.state = self.reducer(action.type, action.payload, self.state, assign);
      self.listener(self.state);
      return callback();
    }
    // `action` is a function.
    if (typeof action === 'function') {
      return promise(action.bind(self));
    }
    // `action` is a promise.
    return action.then(function(action) {
      action && self.dispatch(action);
      callback();
    });
  }
};
