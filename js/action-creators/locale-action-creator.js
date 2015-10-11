var LocaleActionTypes = require('js/action-types/locale-action-types');

module.exports = {
  setLocale: function(locale) {
    return {
      type: LocaleActionTypes.SET_LOCALE,
      payload: {
        locale: locale
      }
    };
  }
};
