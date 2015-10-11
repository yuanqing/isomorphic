var cors = require('cors');
var express = require('express');

var app = express();

app.get('/', cors(), function(req, res) {
  res.json({ foo: 'pass' });
});

app.all('*', cors(), function(req, res) {
  res.status(404);
  res.json({ foo: 'fail' });
});

module.exports = app;
