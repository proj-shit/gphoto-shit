import { EventListener } from '/common/utils.js'
import { shit } from '/common/window_utils.js';
import platform from '/common/platform.js'
import './ui.js';
import { ui } from './ui.js';

platform.runtime.onMessage.addListener(
	(message) => {
		if (message["EVENT"]) {
			var m;
			if (m = message["EVENT"]["ui_gapi_helper.onSignIn"]) {
				shit.ensureLoadComplete().
					then(() => {
						document.documentElement.classList.remove("before-sign-in");
					});
			}
			if (m = message["EVENT"]["ui_gapi_helper.onSignInFailed"]) {
				if (m.error == "FAIL: Get account from tab") {
					shit.ensureLoadComplete().
						then(() => ui.refreshTab());
				}
			}
		}
	},
	{ listenLocal: true },
);

shit.ensureLoadComplete()
	.then(() => {
		document.documentElement.classList.remove("before-load");
	})
	.then(() =>
		Promise.all([
			// Close popup if refresh
			async function () {
				platform.tabs.onUpdated.addListener(
					(tabId, changeInfo) => {
						platform.tabs.query({ active: true, currentWindow: true })
							.then(([tab]) => {
								if (tab.id != tabId) return;

								if (tab.active && changeInfo.status == "loading") {
									window.close();
								}
							});

					})
			}(),
			// Load title text after ui.css ready
			async function () { // Load ui.css
				return new Promise(
					resolve => {
						if (document.querySelector("link#ui-style")) resolve();

						var stylesheet = document.createElement("link");
						document.head.appendChild(stylesheet),
							stylesheet.id = "ui-style",
							stylesheet.rel = "stylesheet",
							stylesheet.href = "popup.css",
							stylesheet.onload = () => {
								resolve()
							};
					}
				)
			}()
				.then(() => { // Load title text
					document.querySelector("#title-text-container").innerHTML = platform.locale.getLocalizedText("title_text_element");
				}),
		])
	);

top.DEPENDENCY.wait([{ id: "feature_loader" }])
	.then(
		() => {
			EventListener().listen(
				top.FEATURE,
				"listready",
				() => {
					var menu = top.document.querySelector("#feature-menu");
					var _ = async function () {
						return new Promise(
							resolve => {
								top.document.querySelector("#feature-menu-style") || function () {
									var stylesheet = top.document.createElement("link");
									top.document.head.appendChild(stylesheet);
									stylesheet.id = "feature-menu-style";
									stylesheet.rel = "stylesheet";
									stylesheet.href = "/ui/feature-menu.css";
									stylesheet.onload = () => {
										resolve();
									};
								}();
							}
						)
					}()
						.then(
							() => {
								for (const feat of FEATURE.list) {
									addFeatureToMenu(menu, Object.assign({ name: FEATURE.locale.getName(feat.id) }, feat));
								}
							}
						);

					function onFeatureMenuItemClick(e) {
						var item = e.currentTarget;
						var prev = menu.querySelector("[active]");
						if (item == prev) return;

						var ifr = document.querySelector("#feature-iframe")

						// Exclusive selection
						prev && prev.removeAttribute("active");
						item.setAttribute("active", "");

						// Update feature status
						FEATURE.setActive(item.id);

						ifr.src = `/feature/${item.id}/index.html`;

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
				},
				{ once: true },
			);
		}
	);

// Load modules
[
	{ id: "ui_gapi_helper", src: "./ui_gapi_helper.js" },
	{ id: "feature_loader", src: "/feature/feature_loader.js" },
].map(top.DEPENDENCY.load);