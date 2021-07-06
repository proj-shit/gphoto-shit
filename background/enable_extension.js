async function updateExtensionStatus(currTab) {
	var match = false;
	for (var w of platform.runtime.getManifest()["action"]["matches"]) {
		if (match |= WildcardURLRegExp(w).test(currTab.url)) break;
	}
	await (match ? platform.action.enable : platform.action.disable)(currTab.tabId);
}

platform.tabs.query({ active: true })
	.then(tabs => {
		if (t = tabs[0]) {
			return t
		} else {
			throw "no tabs"
		}
	})
	.then(updateExtensionStatus)

platform.tabs.onActivated.addListener(async info => {
	var tab = await platform.tabs.get(info.tabId);
	await updateExtensionStatus(tab);
});
platform.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
	var tab = await platform.tabs.get(tabId);
	if (tab.active && changeInfo.url) {
		await updateExtensionStatus(tab);
	}
});