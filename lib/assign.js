var objectAssign = require('object-assign');

// This function receives any number of objects as arguments, and merges them.
// A new object is returned. Does not mutate any of its arguments.
module.exports = function() {
  return objectAssign.apply(null, [{}].concat([].slice.call(arguments)));
};
