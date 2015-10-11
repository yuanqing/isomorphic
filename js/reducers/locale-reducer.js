var LocaleActionTypes = require('js/action-types/locale-action-types');

module.exports = function(action, state) {
  switch (action.type) {
  case LocaleActionTypes.SET_LOCALE:
    return action.payload.locale;
  default:
    return state;
  }
};
