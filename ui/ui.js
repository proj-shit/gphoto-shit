async function ensureLoadComplete(w) {
	return new Promise(
		resolve => {
			w = w || window;
			if (document.readyState === "complete") {
				resolve();
				return;
			}
			window.addEventListener("load", () => {
				resolve();
			});
		}
	)
}

ensureLoadComplete()
	.then(() => {
		document.documentElement.classList.remove("preload");
	})
	.then(() => {
		DEPENDENCY.wait([{ id: "platform" }])
			.then(() => {
				return new Promise(
					resolve => {
						if (document.querySelector("link#ui-style")) resolve();

						var stylesheet = document.createElement("link");
						document.head.appendChild(stylesheet),
							stylesheet.id = "ui-style",
							stylesheet.rel = "stylesheet",
							stylesheet.href = "ui.css",
							stylesheet.onload = () => {
								resolve()
							};
					}
				)
			})
			.then(() => {
				document.querySelector("#title-text-container").innerHTML = platform.locale.getLocalizedText("title_text_element");
			})
	});

[
	{ id: "gapiloader", src: "gapiloader.js" },
	{ id: "platform", src: "/platform/platform.js" },
	{ id: "featureloader", src: "/feature/featureloader.js" },
].forEach(DEPENDENCY.load);