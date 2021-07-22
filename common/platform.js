var platform = function () {
    var self = undefined;
    if (typeof browser != "undefined") {
        self = browser;
    }
    if (typeof chrome != "undefined") {
        self = chrome;
    }

    self.locale = {};
    self.locale.getActiveLocale = () => { return self.i18n.getMessage("active_locale") };
    self.locale.getLocalizedText = (k) => { return (self.i18n.getMessage(k) || k) };

    if (self.tabs) {
        self.tabs.get = function () {
            const orig_func = self.tabs.get.bind(self.tabs);
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

    if (self.runtime) {
        var _ = function () {
            var localMessager = new EventTarget;

            self.runtime.sendMessage = function () {
                const orig_func = self.runtime.sendMessage.bind(self.runtime);
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
                        console.log("override self.runtime.sendMessage", error)
                    }
                    return orig_func(...args);
                }
            }();

            self.runtime.onMessage.addListener = function () {
                const orig_func = self.runtime.onMessage.addListener.bind(self.runtime.onMessage);
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
                        console.log("override self.runtime.onMessage.addListener", error)
                    }
                    orig_func(listener);
                }
            }();
        }();
    }

    return self;
}();

export default platform;