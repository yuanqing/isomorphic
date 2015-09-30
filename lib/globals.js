// Some frequently-used constants, for convenience.

var IS_SERVER = typeof window === 'undefined';

module.exports = {
  IS_SERVER: IS_SERVER,
  IS_CLIENT: !IS_SERVER
};
