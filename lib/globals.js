var IS_SERVER = typeof window === 'undefined';

// Some frequently-used constants, for convenience.
module.exports = {
  IS_SERVER: IS_SERVER,
  IS_CLIENT: !IS_SERVER
};
