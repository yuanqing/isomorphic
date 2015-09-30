var objectAssign = require('object-assign');

// This function receives any number of objects as arguments, and merges them.
// Does not mutate any of the arguments; always returns a new object.
module.exports = function() {
  return objectAssign.apply(null, [{}].concat([].slice.call(arguments)));
};
