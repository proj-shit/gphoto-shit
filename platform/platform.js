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

if (platform.tabs) {
    platform.tabs.get = function () {
        const orig_get = platform.tabs.get.bind(platform.tabs);
        return async function (tabId) {
            return new Promise(
                resolve => {
                    var tryGet = () => {
                        orig_get(tabId)
                            .then(resolve)
                            .catch(() => {
                                setTimeout(() => {
                                    tryGet(tabId);
                                }, 50);
                            })
                    };
                    tryGet();
                }
            )
        }
    }();
}