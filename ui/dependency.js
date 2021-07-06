var DEPENDENCY = top.DEPENDENCY || new function () {
    var loaded = []
    var self = Object.assign(
        new EventTarget,
        {
            /**
             * @param {{id?: string, src: string}} dep 
             */
            load: async function (dep) {
                return new Promise(
                    resolve => {
                        s = document.createElement("script"),
                            s.type = "text/javascript",
                            s.id = dep.id ? dep.id : null,
                            s.src = dep.src,
                            s.onload = () => {
                                loaded.push(dep);
                                self.dispatchEvent((e = new Event("depload"), e.dep = dep, e));
                                resolve();
                            },
                            document.head.appendChild(s)
                    }
                )

            },
            loaded: () => { return loaded; },
            /**
             * @param {[{id?: string, src?: string}]} deps 
             * @returns {Promise<[{id: string, src: string}]>}
             */
            wait: async (deps) => {
                return new Promise(
                    resolve => {
                        function filter() {
                            return loaded.filter(e => {
                                for (f of deps) {
                                    var match = true
                                    for (k of Object.keys(f)) {
                                        match &= (f[k] == e[k])
                                    }
                                    if (match) {
                                        return true
                                    }
                                }
                                return false
                            })
                        }
                        function match() {
                            var matches = filter();
                            if (matches.length == deps.length) {
                                resolve(matches);
                            }
                        }

                        match()
                        self.addEventListener("depload", match, { once: false })
                    }
                )
            }
        },
    )
    return self;
}();

// var EventListener = function () {
//     var self = {
//         listen: (target, eventName, func, options) => {
//             _target = target, _eventName = eventName, _func = func, _options = options;
//             _target.addEventListener(eventName, func, options);
//         },
//         cancel: () => {
//             _target.removeEventListener(eventName, func, options);
//         }
//     }

//     var _target, _eventName, _func, _options;
//     return self;
// };

// var Sandbox = function () {
//     var self = {
//         /**
//          * @param {string} str 
//          * @returns 
//          */
//         eval: async (str) => {
//             return await self.ensureSandBoxLoadComplete().
//                 then(() => callSandBox({ id: getRandomID(sandBoxEvalIfr.id), eval: str }));
//         },
//         /**
//          * @param {string} src 
//          * @returns 
//          */
//         evalSrc: async (src) => {
//             return await self.ensureSandBoxLoadComplete().
//                 then(() => callSandBox({ id: getRandomID(sandBoxEvalIfr.id), evalSrc: src }));
//         },
//         /**
//          * @param {string} target 
//          * @param {string} func 
//          * @param {[...string]} args 
//          * @returns 
//          */
//         invoke: async (target, func, args) => {
//             return await self.ensureSandBoxLoadComplete().
//                 then(() => callSandBox({
//                     id: getRandomID(sandBoxEvalIfr.id), invoke: {
//                         target: target,
//                         func: func,
//                         args: args,
//                     }
//                 }))
//         },
//         /**
//          * @param {[...string]} propertyPath 
//          * @returns 
//          */
//         get: async (propertyPath) => {
//             return await self.eval(
//                 "(" + self.varToPropertyPath(propertyPath) + ")"
//             );
//         },
//         /**
//          * @param {[...string]} propertyPath 
//          * @param {string} val
//          * @returns 
//          */
//         set: async (propertyPath, val) => {
//             return await self.eval(
//                 self.varToPropertyPath(propertyPath) + " = " + val
//             );
//         },
//         /**
//          * @param  {...string} args 
//          */
//         log: (...args) => {
//             self.invoke("console", "log", args)
//         }
//     }

//     self.ensureSandBoxLoadComplete = async function () {
//         return new Promise(
//             async (resolve) => {
//                 if (!sandBoxEvalIfr.parentNode) {
//                     await window.ensureLoadComplete().then(() => {
//                         document.body.appendChild(sandBoxEvalIfr);
//                     });
//                 }

//                 if (sandBoxEvalIfr.loaded) {
//                     resolve();
//                     return;
//                 }
//                 sandBoxEvalIfr.addEventListener("load", () => {
//                     resolve();
//                 }, { once: true });
//             }
//         )
//     }

//     /**
//      * @param {[...string]} propertyPath 
//      * @returns 
//      */
//     self.varToPropertyPath = (propertyPath) => {
//         var ret;
//         if (typeof propertyPath === "string") {
//             return propertyPath;
//         }
//         if (Array.isArray(propertyPath)) {
//             for (p of propertyPath) {
//                 if (!ret) {
//                     ret = p.toString();
//                 } else {
//                     ret += "[" + p.toString() + "]";
//                 }
//             }
//         }
//         return ret
//     }

//     function getRandomID(prefix) {
//         return (prefix ? prefix + "." : "") + (Math.random() * 0xffffffff | 0);
//     }

//     async function callSandBox(msg) {
//         return new Promise(
//             resolve => {
//                 sandBoxEvalIfr.addEventListener("evalreturn:" + msg.id, (e) => {
//                     if (e.error) console.log(e.type, e.error);
//                     resolve(e.evalResult);
//                 }, { once: true })
//                 sandBoxEvalIfr.contentWindow.postMessage(msg, '*');
//             }
//         )
//     }

//     var sandBoxEvalIfr = document.createElement("iframe");
//     sandBoxEvalIfr.src = "sandbox/eval.html",
//         sandBoxEvalIfr.style.display = "none",
//         sandBoxEvalIfr.id = "sandbox-" + getRandomID(),
//         sandBoxEvalIfr.onload = () => {
//             sandBoxEvalIfr.loaded = true;
//             self.set("SANDBOX_ID", `"${sandBoxEvalIfr.id}"`)
//         };

//     window.addEventListener("message", (e) => {
//         if (typeof e.data.id == "undefined") return;
//         if (!e.data.id.startsWith(sandBoxEvalIfr.id)) return;

//         sandBoxEvalIfr.dispatchEvent(Object.assign(new Event("evalreturn:" + e.data.id), e.data))
//     });

//     return self;
// };