// import '/platform/platform.js';
var platform = function () {
    if (typeof browser != "undefined") {
        return browser;
    }
    if (typeof chrome != "undefined") {
        return chrome;
    }
}();
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
// end import

// import 'utils.js'
RegExp.escapeInput = (s) => {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
var WildcardURLRegExp = function (w) { return RegExp(RegExp.escapeInput(w).replace(/\*/g, ".*?")); };
// end import

try {
    importScripts([
        "/background/enable_extension.js",
    ])
} catch (error) {
    console.error(error);
}
