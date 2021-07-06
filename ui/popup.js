ensureLoadComplete()
	.then(() => {
		document.documentElement.classList.remove("before-load");
	})
	.then(() => {
		DEPENDENCY.wait([{ id: "platform" }])
			.then(Promise.all([
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
			]))

	});

[
	{ id: "ui_gapi_helper", src: "./ui_gapi_helper.js" },
	{ id: "platform", src: "/common/platform.js" },
	{ id: "feature_loader", src: "/feature/feature_loader.js" },
].map(DEPENDENCY.load);