var LocaleActionTypes = require('../action-types/locale-action-types');

module.exports = function(type, payload, state) {
  switch (type) {
  case LocaleActionTypes.SET_LOCALE:
    return payload.language + '-' + payload.country;
  default:
    return state;
  }
};
