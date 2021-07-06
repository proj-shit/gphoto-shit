async function ensureLoadComplete(w) {
    return new Promise(
        resolve => {
            w = w || window;
            if (document.readyState === "complete") {
                resolve();
                return;
            }
            EventListener().listen(
                window,
                "load",
                () => {
                    resolve();
                },
                { once: true },
            )
        }
    )
}

var EventListener = function () {
    var self = {
        listen: (target, eventName, func, options) => {
            _target = target, _eventName = eventName, _func = func, _options = options;
            _target.addEventListener(eventName, func, options);

            return self;
        },
        cancel: () => {
            _target.removeEventListener(_eventName, _func, _options);

            return self;
        }
    }

    var _target, _eventName, _func, _options;
    return self;
};