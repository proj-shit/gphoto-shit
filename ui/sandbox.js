/**** require /common/platform.js ****/
/**** require /common/window_util.js ****/

var Sandbox = function () {
    window.SANDBOX_RETURN_LISTENER || (window.SANDBOX_RETURN_LISTENER = EventListener().listen(
        window,
        "message", (e) => {
            if (typeof e.data.id == "undefined") return;
            if (!e.data.id.startsWith("sandbox-")) return;

            sandBoxEvalIfr.dispatchEvent(Object.assign(new Event("evalreturn:" + e.data.id), e.data))
        }
    ));

    var self = {
        destroy: () => {
            sandBoxEvalIfr.remove();
        },
        /**
         * @param {string} str 
         * @returns 
         */
        eval: async (str) => {
            return await self.ensureSandBoxLoadComplete().
                then(() => callSandBox({ id: getRandomID(sandBoxEvalIfr.id), eval: str }));
        },
        /**
         * @param {string} src 
         * @returns 
         */
        evalSrc: async (src) => {
            return await self.ensureSandBoxLoadComplete().
                then(() => callSandBox({ id: getRandomID(sandBoxEvalIfr.id), evalSrc: src }));
        },
        /**
         * @param {string} target 
         * @param {string} func 
         * @param {[...string]} args 
         * @returns 
         */
        invoke: async (target, func, args) => {
            return await self.ensureSandBoxLoadComplete().
                then(() => callSandBox({
                    id: getRandomID(sandBoxEvalIfr.id), invoke: {
                        target: target,
                        func: func,
                        args: args,
                    }
                }))
        },
        /**
         * @param {[...string]} propertyPath 
         * @returns 
         */
        get: async (propertyPath) => {
            return await self.eval(
                "(" + self.varToPropertyPath(propertyPath) + ")"
            );
        },
        /**
         * @param {[...string]} propertyPath 
         * @param {string} val
         * @returns 
         */
        set: async (propertyPath, val) => {
            return await self.eval(
                self.varToPropertyPath(propertyPath) + " = " + val
            );
        },
        /**
         * @param  {...string} args 
         */
        log: (...args) => {
            self.invoke("console", "log", args)
        }
    }

    self.ensureSandBoxLoadComplete = async function () {
        return new Promise(
            async (resolve) => {
                if (!sandBoxEvalIfr.parentNode) {
                    await window.ensureLoadComplete().then(() => {
                        document.body.appendChild(sandBoxEvalIfr);
                    });
                }

                if (sandBoxEvalIfr.loaded) {
                    resolve();
                    return;
                }

                EventListener().listen(
                    sandBoxEvalIfr,
                    "load", () => {
                        resolve();
                    }, { once: true }
                );
            }
        )
    }

    /**
     * @param {[...string]} propertyPath 
     * @returns 
     */
    self.varToPropertyPath = (propertyPath) => {
        var ret;
        if (typeof propertyPath === "string") {
            return propertyPath;
        }
        if (Array.isArray(propertyPath)) {
            for (p of propertyPath) {
                if (!ret) {
                    ret = p.toString();
                } else {
                    ret += "[" + p.toString() + "]";
                }
            }
        }
        return ret
    }

    function getRandomID(prefix) {
        return (prefix ? prefix + "." : "") + (Math.random() * 0xffffffff | 0);
    }

    async function callSandBox(msg) {
        return new Promise(
            resolve => {
                EventListener().listen(
                    sandBoxEvalIfr,
                    "evalreturn:" + msg.id, (e) => {
                        if (e.error) console.log("sandbox.js", e.type, e.error);
                        resolve(e.evalResult);
                    }, { once: true }
                );
                sandBoxEvalIfr.contentWindow.postMessage(msg, '*');
            }
        )
    }

    var sandBoxEvalIfr = document.createElement("iframe");
    sandBoxEvalIfr.src = platform.runtime.getURL("/sandbox/eval.html"),
        sandBoxEvalIfr.style.display = "none",
        sandBoxEvalIfr.id = "sandbox-" + getRandomID(),
        sandBoxEvalIfr.onload = () => {
            sandBoxEvalIfr.loaded = true;
            self.set("SANDBOX_ID", `"${sandBoxEvalIfr.id}"`)
        };

    return self;
};