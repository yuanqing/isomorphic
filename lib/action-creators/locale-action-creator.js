var LocaleActionTypes = require('../action-types/locale-action-types');

module.exports = {
  setLocale: function(payload) {
    return {
      type: LocaleActionTypes.SET_LOCALE,
      payload: {
        language: payload.language,
        country: payload.country
      }
    };
  }
};
