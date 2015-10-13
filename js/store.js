var Store = require('lib/store');
var reducers = require('./reducers');

module.exports = new Store(reducers, window.__STATE__);
