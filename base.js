var Shared = top.Shared || function () {
    return {
        gapi: {},
    }
}();

var Dependency = top.Dependency || function () {
    var loaded = []
    var self = Object.assign(
        new EventTarget,
        {
            /**
             * @param {{id?: string, src: string}} dep 
             */
            load: function (dep) {
                s = document.createElement("script"),
                    s.id = dep.id ? dep.id : null,
                    s.type = "text/javascript",
                    s.src = dep.src,
                    s.onload = () => {
                        loaded.push(dep);
                        self.dispatchEvent((e = new Event("depload"), e.dep = dep, e));
                    },
                    document.head.appendChild(s)
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
                        self.addEventListener("depload", match, {once: false})
                    }
                )
            }
        },
    )
    return self;
}();

[
    { id: "platformswitch", src: "platform/platformswitch.js" },
    { id: "features", src: "features/features.js" },
].forEach(Dependency.load);