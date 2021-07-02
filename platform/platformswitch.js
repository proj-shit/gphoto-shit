_ = function () {
    function loadJS(jsSrc) {
        document.querySelector("script#platformswitch").remove()
        Dependency.load({src: jsSrc, id: "platform"})
    }
    if (typeof browser != "undefined") {
        loadJS("platform/platform-browser.js")
    }
    if (typeof chrome != "undefined") {
        loadJS("platform/platform-chrome.js")
    }
}()

class PlatformRunner {
    /**
     * @param {function(string): string} getURL
     */
    constructor(
        getURL
    ) {
        this.runtime = {}
        this.runtime.getURL = getURL
    }
}