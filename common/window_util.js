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

/**
 * @param {(self:Object,params:{elapsedTime:number,deltaTime:number}) => void} onUpdateCallback 
 */
var FrameUpdate = function (onUpdateCallback) {
    var elapsedTime = 0;
    var lastUpdateTime = null;
    var isDone = false;

    var self = {
        done: function () {
            isDone = true
        },
        apply: async function (
            /**
             * @type {{any:*}}
             */
            params,
        ) {
            return new Promise(
                resolve => {
                    params = params || {};

                    var onFrame = (now) => {
                        // First time
                        if (lastUpdateTime == null) { lastUpdateTime = now }

                        var deltaTime = now - lastUpdateTime;
                        lastUpdateTime = now;
                        elapsedTime += deltaTime;

                        onUpdateCallback(
                            self,
                            Object.assign(
                                params,
                                {
                                    elapsedTime: elapsedTime,
                                    deltaTime: deltaTime,
                                },
                            )
                        );

                        if (!isDone) {
                            window.requestAnimationFrame(onFrame);
                        } else {
                            resolve();
                        }
                    }
                    window.requestAnimationFrame(onFrame);
                }
            )

        }
    }

    return self;
}