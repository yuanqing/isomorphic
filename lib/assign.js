var objectAssign = require('object-assign');

module.exports = function() {
  return objectAssign.apply(null, [{}].concat([].slice.call(arguments)));
};
