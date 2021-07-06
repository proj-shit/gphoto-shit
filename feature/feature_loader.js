var FEATURE = top.FEATURE || function () {
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
                    document.querySelector("#feature-menu-style") || (
                        stylesheet = document.createElement("link"),
                        document.head.appendChild(stylesheet),
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

        var menu = document.querySelector("#feature-menu");
        for (feat of FEATURE.list) {
            addFeatureToMenu(menu, feat)
        }

        function onFeatureMenuItemClick(e) {
            var item = e.currentTarget;

            (p = item.parentNode.querySelector(":scope > [active]")) && (p.removeAttribute("active"));
            item.setAttribute("active", "");
        }

        function addFeatureToMenu(menuNode, feat) {
            var a = document.createElement("a")
            menuNode.appendChild(a),
                a.classList.add("feature-menu-item-a"),
                a.href = `/feature/${feat.id}/index.html`,
                a.target = "feature-iframe",
                a.onclick = onFeatureMenuItemClick;

            var div = document.createElement("div");
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

            var textLayoutDiv = document.createElement("div");
            div.appendChild(textLayoutDiv),
                textLayoutDiv.style.display = "inline"

            var textDiv = document.createElement("div");
            textLayoutDiv.appendChild(textDiv),
                textDiv.classList.add("feature-menu-item-text"),
                textDiv.innerHTML = feat.name[platform.locale.getActiveLocale()];
        }

        self.dispatchEvent(new Event("menuready"))
    }()

    return self;
}();
