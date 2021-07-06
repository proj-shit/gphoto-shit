var platform = function () {
	if (typeof browser != "undefined") {
		return browser;
    }
    if (typeof chrome != "undefined") {
        return chrome;
    }
}()

importScripts([
	"/background/enable_extension.js",
])