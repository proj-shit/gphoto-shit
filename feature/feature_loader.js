top.FEATURE = top.FEATURE || function () {
    var self = Object.assign(
        new EventTarget,
        {
            list: null,
        }
    )

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
        for (feat of FEATURE.list) {
            await fetch(`/feature/${feat.id}/_locales/${platform.locale.getActiveLocale()}/messages.json`)
                .then(r => r.json())
                .then(j => j["_NAME_"]["message"])
                .catch(() => feat.id)
                .then(name => { 
                    addFeatureToMenu(menu, Object.assign({ name: name }, feat));
                });
        }

        self.dispatchEvent(new Event("menuready"))

        function onFeatureMenuItemClick(e) {
            var item = e.currentTarget;

            (p = menu.querySelector("[active]")) && (p.removeAttribute("active"));
            item.setAttribute("active", "");
        }

        async function addFeatureToMenu(menuNode, feat) {
            var a = top.document.createElement("a")
            menuNode.appendChild(a),
                a.classList.add("feature-menu-item-a"),
                a.href = `/feature/${feat.id}/index.html`,
                a.target = "feature-iframe",
                a.onclick = onFeatureMenuItemClick;

            var div = top.document.createElement("div");
            a.appendChild(div),
                div.classList.add("feature-menu-item-layout")

            fetch(platform.runtime.getURL(`/feature/${feat.id}/icon.svg`))
                .then(r => r.text())
                .then(t => {
                    div.innerHTML = t + div.innerHTML;
                    return div.querySelector("svg");
                })
                .then(
                    svg => {
                        svg.classList.add("feature-menu-item-icon"),
                            svg.style.display = "inline";
                    }
                );

            var textLayoutDiv = top.document.createElement("div");
            div.appendChild(textLayoutDiv),
                textLayoutDiv.style.display = "inline"

            var textDiv = top.document.createElement("div");
            textLayoutDiv.appendChild(textDiv),
                textDiv.classList.add("feature-menu-item-text"),
                textDiv.innerHTML = feat.name;
        }
    }()

    return self;
}();
