console.log("background", "enable_extension.js")

// async function updateExtensionStatus(currTab) {
// 	var match = false;
// 	for (var w of platform.runtime.getManifest()["action"]["matches"]) {
// 		if (match |= WildcardURLRegExp(w).test(currTab.url)) break;
// 	}
// 	await (match ? platform.action.enable : platform.action.disable)(currTab.tabId);
// }

// platform.tabs.query({ active: true, currentWindow: true })
// 	.then(([tab]) => tab)
// 	.then(updateExtensionStatus)

// platform.tabs.onActivated.addListener(info => {
// 	platform.tabs.get(info.tabId)
// 		.then(tab => { updateExtensionStatus(tab); });
// });
// platform.tabs.onUpdated.addListener((tabId, changeInfo) => {
// 	platform.tabs.get(tabId)
// 		.then(tab => {
// 			if (tab.active && changeInfo.url) {
// 				updateExtensionStatus(tab);
// 			}
// 		});
// });