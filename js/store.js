var Store = require('../lib/store');
var reducers = require('./reducers');

module.exports = require('../lib/is-client') ? new Store(reducers, window.__STATE__) : {};
