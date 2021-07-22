import {EventListener} from '/common/utils.js'

export var shit = shit || function () {
    var self = {};

    self.ensureLoadComplete = async function (w) {
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
    };
    
    self.execAllInsertSrc = async function (root) {
        root = root || document;
        return [...root.querySelectorAll('[shit-insert-src]')].map(e => self.execInsertSrc(e));
    };
    self.execInsertSrc = async function (elem) {
        return fetch(elem.getAttribute("shit-insert-src"))
            .then(r => r.text())
            .then(t => { elem.innerHTML = t });
    };
    
    self.execAllLocalize = function (root) {
        root = root || document;
    
        [...root.querySelectorAll('[shit-localize]')].forEach(e => {
            e[e.getAttribute("shit-localize")] = top.FEATURE.locale.getLocalizedText(e[e.getAttribute("shit-localize")]);
        });
    };

    return self;
}();

/**
 * @param {(self:Object,params:{elapsedTime:number,deltaTime:number}) => void} onUpdateCallback 
 */
export var FrameUpdate = function (onUpdateCallback) {
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