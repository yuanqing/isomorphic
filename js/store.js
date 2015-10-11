var Store = require('lib/store');
var reducers = require('./reducers');

module.exports = process.browser ? new Store(reducers, window.__STATE__) : {};
