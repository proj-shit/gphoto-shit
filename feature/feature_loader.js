top.FEATURE = top.FEATURE || function () {
    var self = Object.assign(
        new EventTarget,
        {
            list: null,
            locale: {
                getLocalizedText: function (key) {
                    if (activeLocale == null) throw "activeLocale not ready";
                    return (activeLocale[key] ? activeLocale[key].text : key);
                },
            }
        }
    )

    var activeLocale = null;
    async function fetchLocaleTextObject(featid) {
        return fetch(`/feature/${featid}/_locales/${platform.locale.getActiveLocale()}/text.json`)
            .then(r => r.json());
    }

    _ = async function () {
        await DEPENDENCY.wait([{ id: "platform" }])

        self.list = await fetch(platform.runtime.getURL("/feature/feature.json"))
            .then(r => r.json());

        self.dispatchEvent(new Event("listready"));

        await async function () {
            return new Promise(
                resolve => {
                    top.document.querySelector("#feature-menu-style") || (
                        stylesheet = top.document.createElement("link"),
                        top.document.head.appendChild(stylesheet),
                        stylesheet.id = "feature-menu-style",
                        stylesheet.rel = "stylesheet",
                        stylesheet.href = "/feature/feature-menu.css",
                        stylesheet.onload = () => {
                            resolve();
                        }
                    );
                }
            )
        }()

        var menu = top.document.querySelector("#feature-menu");
        for (const feat of FEATURE.list) {
            await fetchLocaleTextObject(feat.id)
                .then(j => j["_FEAT_NAME_"]["text"])
                .catch(() => feat.id)
                .then(name => addFeatureToMenu(menu, Object.assign({ name: name }, feat)));
        }

        self.dispatchEvent(new Event("menuready"))

        function onFeatureMenuItemClick(e) {
            var item = e.currentTarget;
            var prev = menu.querySelector("[active]");
            if (item == prev) return;

            var ifr = document.querySelector("#feature-iframe")
            activeLocale = null;

            Promise.all([
                async function () {
                    prev && prev.removeAttribute("active");
                    item.setAttribute("active", "");
                }(),
                fetchLocaleTextObject(item.id)
                    .then(j => { activeLocale = j; }),
            ])
                .then(
                    ifr.src = `/feature/${item.id}/index.html`
                )

        }

        async function addFeatureToMenu(menuNode, feat) {
            var a = top.document.createElement("a")
            menuNode.appendChild(a),
                a.classList.add("feature-menu-item-a"),
                a.target = "feature-iframe",
                a.id = feat.id,
                a.onclick = onFeatureMenuItemClick;

            var div = top.document.createElement("div");
            a.appendChild(div),
                div.classList.add("feature-menu-item-layout")

            var textLayoutDiv = top.document.createElement("div");
            div.appendChild(textLayoutDiv),
                textLayoutDiv.style.display = "inline"

            var textDiv = top.document.createElement("div");
            textLayoutDiv.appendChild(textDiv),
                textDiv.classList.add("feature-menu-item-text"),
                textDiv.innerHTML = feat.name;

            await fetch(platform.runtime.getURL(`/feature/${feat.id}/icon.svg`))
                .then(r => r.text())
                .then(t => {
                    div.innerHTML = t + div.innerHTML;
                    return div.querySelector("svg");
                })
                .then(
                    svg => {
                        svg.classList.add("feature-menu-item-icon");
                        svg.style.display = "inline";
                    }
                );
        }
    }()

    return self;
}();

