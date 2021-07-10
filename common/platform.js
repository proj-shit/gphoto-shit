var platform = function () {
    if (typeof browser != "undefined") {
        return browser;
    }
    if (typeof chrome != "undefined") {
        return chrome;
    }
}();

platform.locale = {};
platform.locale.getActiveLocale = () => { return platform.i18n.getMessage("active_locale") };
platform.locale.getLocalizedText = (k) => { return (platform.i18n.getMessage(k) || k) };

if (platform.tabs) {
    platform.tabs.get = function () {
        const orig_func = platform.tabs.get.bind(platform.tabs);
        return async function (tabId) {
            return new Promise(
                resolve => {
                    var tryGet = () => {
                        orig_func(tabId)
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

if (platform.runtime) {
    _ = function () {
        var localMessager = new EventTarget;

        platform.runtime.sendMessage = function () {
            const orig_func = platform.runtime.sendMessage.bind(platform.runtime);
            return function (...args) {
                try {
                    [extensionId, message, options, responseCallback] = function (args) {
                        if (typeof args[0] != "string") args.unshift(undefined);
                        if (typeof args[2] != "object") args.splice(2, 0, undefined);
                        if (typeof args[3] != "function") args.splice(3, 0, undefined);
                        return args;
                    }([...args]);

                    if (options && options.sendToLocal) {
                        localMessager.dispatchEvent(Object.assign(new Event(""), { message: message }));
                        delete options.sendToLocal; // Restore to standard
                    }

                } catch (error) {
                    console.log("override platform.runtime.sendMessage", error)
                }
                return orig_func(...args);
            }
        }();

        platform.runtime.onMessage.addListener = function () {
            const orig_func = platform.runtime.onMessage.addListener.bind(platform.runtime.onMessage);
            return function (listener, options) {
                try {
                    if (options) {
                        if (options.listenLocal) {
                            localMessager.addEventListener("", e => {
                                listener(e.message);
                            });
                        }
                    }
                } catch (error) {
                    console.log("override platform.runtime.onMessage.addListener", error)
                }
                orig_func(listener);
            }
        }();
    }();
}