var platform = new PlatformRunner(
    // runtime
    chrome.runtime.getURL,

    // locale
    () => { return chrome.i18n.getMessage("active_locale") }, // No `chrome.i18n.getUILanguage` because no fallback to en
    chrome.i18n.getMessage,
)