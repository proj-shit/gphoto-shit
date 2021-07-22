import platform from '/common/platform.js'

top.FEATURE = top.FEATURE || function () {
    var self = Object.assign(
        new EventTarget,
        {
            list: null,
            setActive: function (featid) {
                activeFeatID = featid;
            },
            locale: {
                getName: function (featid) {
                    return this.getLocalizedText("_FEAT_NAME_", featid);
                },
                getLocalizedText: function (key, featid) {
                    featid = featid || activeFeatID;
                    if (localizedText == null) throw "activeLocale not ready";
                    return (localizedText[featid] && localizedText[featid][key] ? localizedText[featid][key].text : key);
                },
            },
        }
    )

    var activeFeatID = null;
    var localizedText = null;

    async function fetchLocaleTextObject(featid) {
        return fetch(`/feature/${featid}/_locales/${platform.locale.getActiveLocale()}/text.json`)
            .then(r => r.json());
    }

    var _ = async function () {
        // Load enabled features
        self.list = await fetch(platform.runtime.getURL("/feature/feature.json"))
            .then(r => r.json());

        // Load features' locale
        localizedText = {};
        await Promise.all(self.list.map(
            e =>
                fetchLocaleTextObject(e.id)
                    .then(o => { localizedText[e.id] = o })
                    .catch(e => { localizedText[e.id] = {} })
        ));

        self.dispatchEvent(new Event("listready"));
    }()

    return self;
}();

