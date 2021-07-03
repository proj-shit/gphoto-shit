var Feature = top.Feature || function () {
    var self = Object.assign(
        new EventTarget,
        {
            list: null,
        }
    )

    _ = async function () {
        await Dependency.wait([{ id: "platform" }])

        self.list = await fetch(platform.runtime.getURL("features/features.json")).
            then(r => r.json())

        self.dispatchEvent(new Event("listready"))
    }()

    return self;
}();

_ = function() {
    Feature.addEventListener("listready", () => {
        document.querySelector("#feature-menu-style") || (
            style = document.createElement("link"),
            document.head.appendChild(style),
            style.id = "feature-menu-style",
            style.rel = "stylesheet",
            style.href = "features/feature-menu.css"
        );

        var menu = document.querySelector("#feature-menu");
        for (feat of Feature.list) {
            addFeatureToMenu(menu, feat)
        }
    })

    function onFeatureMenuItemClick(e) {
        var item = e.currentTarget;

        (p = item.parentNode.querySelector(":scope > [active]")) && (p.removeAttribute("active"));
        item.setAttribute("active", "");
    }

    function addFeatureToMenu(menuNode, feat) {
        var a = document.createElement("a")
        menuNode.appendChild(a),
        a.classList.add("feature-menu-item-a"),
        a.href = feat.entry_point,
        a.target = "feature-iframe",
        a.onclick = onFeatureMenuItemClick;
        
        var div = document.createElement("div");
        a.appendChild(div),
        div.classList.add("feature-menu-item-layout")

        fetch(platform.runtime.getURL(feat.icon)).
        then(r => r.text()).
        then(t => {
            div.innerHTML = t + div.innerHTML; 
            return div.querySelector("svg");
        }).
        then(
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
}()
