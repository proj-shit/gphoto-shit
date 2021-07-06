var platform = function () {
    if (typeof browser != "undefined") {
        return browser;
    }
    if (typeof chrome != "undefined") {
        return chrome;
    }
}();
platform.locale = {}
platform.locale.getActiveLocale = () => { return platform.i18n.getMessage("active_locale") };
platform.locale.getLocalizedText = platform.i18n.getMessage;