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
        var menu = document.querySelector("#feature-menu");
        for (feat of Feature.list) {
            addFeatureToMenu(menu, feat)
        }
    })

    async function addFeatureToMenu(menuNode, feat) {
        // a = document.createElement("a"),
        // menuNode.appendChild(a),
        // a.href = feat.entry_point
        
        // div = document.createElement("div"),
        // a.appendChild(div),
        // div.innerHTML = await fetch(platform.runtime.getURL(feat.icon)).then(r => r.text())

        // console.log("__MSG_@@ui_locale")
        // titleDiv = document.createElement("div"),
        // div.appendChild(titleDiv),
        // titleDiv.innerHTML = feat.name["en"]
    }
}()
