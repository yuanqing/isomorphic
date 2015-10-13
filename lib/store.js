var each = require('savoy').each;
var assign = require('./assign');
var promise = require('./promise');

var noop = function() {};

var Store = module.exports = function(reducer, initialState) {
  var self = this;
  self.reducer = reducer;
  self.state = initialState || {};
  self.listeners = [];
};

Store.prototype = {
  addListener: function(listener) {
    this.listeners.push(listener);
  },
  removeListener: function(listener) {
    this.listeners.splice(this.listeners.indexOf(listener), 1);
  },
  getState: function() {
    return this.state;
  },
  dispatch: function(action, callback) {
    var self = this;
    callback = callback || noop;
    // Synchronous `action`.
    if (action.type) {
      self.state = self.reducer(action, self.state, assign);
      each(self.listeners, function(listener) {
        listener(self.state);
      });
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
