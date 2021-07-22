import { EventListener } from '/common/utils.js'
import platform from '/common/platform.js'

export async function refreshTab() {
    platform.tabs.query({ active: true, currentWindow: true })
        .then(
            ([tab]) => {
                platform.scripting.executeScript(
                    {
                        target: { tabId: tab.id },
                        function: () => {
                            window.location.reload();
                        },
                    }
                );
            }
        )
    window.close();
}

top.DEPENDENCY = top.DEPENDENCY || function () {
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
                        var s = document.createElement("script");
                        s.type = "module";
                        s.id = dep.id ? dep.id : null;
                        s.src = dep.src;
                        s.onload = () => {
                            loaded.push(dep);
                            resolve();
                        };
                        document.head.appendChild(s);
                    }
                )
                    .then(() => {
                        self.dispatchEvent(Object.assign(new Event("depload"), { "dep": dep }));
                    })
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
                                for (const f of deps) {
                                    var match = true
                                    for (const k of Object.keys(f)) {
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
                                listener && listener.cancel()
                                resolve(matches);
                            }
                        }

                        match();
                        var listener = EventListener().listen(
                            self,
                            "depload",
                            match,
                        );
                    }
                )
            }
        },
    )
    return self;
}();
