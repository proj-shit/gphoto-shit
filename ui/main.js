var STATE = {}

STATE["auto-signin"] = async function () {
	var page = await ensureLoadComplete().then(() => document.querySelector("#page-waiting-signin"));
	return ensureLoadComplete()
		.then(() => { document.querySelectorAll(".full-page").forEach(p => p.style.display = "none"); })
		.then(async function () {
			page.style.display = "block";
		})
		.then(() => new Promise(
			(resolve, reject) => {
				top.UI_GAPI_HELPER.signIn(false)
					.then(
						resolve,
						reject,
					);
			}
		));
};

STATE["signin-google"] = async function () {
	var signInPage = await ensureLoadComplete().then(() => document.querySelector("#page-signin-google"));
	var waitingPage = await ensureLoadComplete().then(() => document.querySelector("#page-waiting-signin"));

	return ensureLoadComplete()
		.then(() => { document.querySelectorAll(".full-page").forEach(p => p.style.display = "none"); })
		.then(() => {
			signInPage.style.display = "block";
			document.querySelector("#signin-button").onclick = () => {
				signInPage.style.display = "none";
				waitingPage.style.display = "block";

				top.UI_GAPI_HELPER.signIn()
					.then(
						STATE["ready"],
						STATE["signin-google"],
					);
			};
		});
};

STATE["ready"] = async function () {
	var page = await ensureLoadComplete().then(() => document.querySelector("#page-ready"));
	return ensureLoadComplete()
		.then(() => { document.querySelectorAll(".full-page").forEach(p => p.style.display = "none"); })
		.then(() => {
			page.style.display = "block";
		});
};

_ = function () {
	// #page-waiting-signin"
	ensureLoadComplete()
		.then(top.DEPENDENCY.wait([{ id: "platform" }]))
		.then(() => {
			var page = document.querySelector("#page-waiting-signin");

			var icon = page.querySelector("#dialog-icon");
			fetch(top.platform.runtime.getURL(icon.getAttribute("src"))).then(r => r.text()).then(t => { icon.innerHTML = t; });
			icon.style.fill = "#3c4043";
			icon.style.opacity = 0.5;
			FrameUpdate((self, params) => {
				if (page.style.display == "none") {
					return;
				}
				const PERIOD = 2000;
				params.changeDelta = (params.changeDelta + params.deltaTime) % PERIOD;

				var factor = params.changeDelta / (PERIOD * .5);
				if (factor > 1) {
					factor = 1.0 - (factor - 1.0)
				}

				icon.style.opacity = 0.5 + (0.3 * factor);

			}).apply({ changeDelta: 0 });

			page.querySelector("#dialog-title").innerHTML = top.platform.locale.getLocalizedText("Signing_in");
			page.querySelector("#dialog-message").innerHTML = top.platform.locale.getLocalizedText("Please_continue_authorization_on_the_popup_window_triggered_by_your_browser");
		});

		// #page-ready"
		ensureLoadComplete()
			.then(top.DEPENDENCY.wait([{ id: "platform" }]))
			.then(() => {
				var page = document.querySelector("#page-ready");
	
				var icon = page.querySelector("#dialog-icon");
				fetch(top.platform.runtime.getURL(icon.getAttribute("src"))).then(r => r.text()).then(t => { icon.innerHTML = t; });
				icon.style.fill = "#33a952";
				icon.style.opacity = 0.5;
	
				page.querySelector("#dialog-title").innerHTML = top.platform.locale.getLocalizedText("Ready");
				page.querySelector("#dialog-message").innerHTML = top.platform.locale.getLocalizedText("Choose_what_you_what_from_the_left_menu");
			});
}()

_ = function () {
	STATE["auto-signin"]()
		.then(
			STATE["ready"],
			STATE["signin-google"],
		);
}()