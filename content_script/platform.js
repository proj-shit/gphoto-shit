var platform = function () {
    var self = undefined;
    if (typeof browser != "undefined") {
        self = browser;
    }
    if (typeof chrome != "undefined") {
        self = chrome;
    }
    return self;
}();