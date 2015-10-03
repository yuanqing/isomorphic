// `envify` and `uglify` will cause the unused `if` branch to be removed.
// Only the appropriate configuration file will be bundled and served.
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./production');
} else {
  module.exports = require('./develop');
}
