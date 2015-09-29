var Store = require('../lib/store');
var reducers = require('./reducers');
var IS_CLIENT = require('./globals').IS_CLIENT;

module.exports = IS_CLIENT ? new Store(reducers, window.__STATE__) : {};
