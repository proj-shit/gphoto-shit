import { shit } from "/common/window_utils.js";
import { FrameUpdate } from "/common/window_utils.js";
import platform from "/common/platform.js";

var STATE = {}

STATE["auto-signin"] = async function () {
	var page = await shit.ensureLoadComplete().then(() => document.querySelector("#page-waiting-signin"));
	return shit.ensureLoadComplete()
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
	var signInPage = await shit.ensureLoadComplete().then(() => document.querySelector("#page-signin-google"));
	var waitingPage = await shit.ensureLoadComplete().then(() => document.querySelector("#page-waiting-signin"));

	return shit.ensureLoadComplete()
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
	var page = await shit.ensureLoadComplete().then(() => document.querySelector("#page-ready"));
	return shit.ensureLoadComplete()
		.then(() => { document.querySelectorAll(".full-page").forEach(p => p.style.display = "none"); })
		.then(() => {
			page.style.display = "block";
		});
};

var _ = function () {
	// #page-waiting-signin"
	shit.ensureLoadComplete()
		.then(() => {
			var page = document.querySelector("#page-waiting-signin");

			var icon = page.querySelector("#dialog-icon");
			shit.execInsertSrc(icon);
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

			page.querySelector("#dialog-title").innerHTML = platform.locale.getLocalizedText("Signing_in");
			page.querySelector("#dialog-message").innerHTML = platform.locale.getLocalizedText("Please_continue_authorization_on_the_popup_window_triggered_by_your_browser");
		});

		// #page-ready"
		shit.ensureLoadComplete()
			.then(() => {
				var page = document.querySelector("#page-ready");
	
				var icon = page.querySelector("#dialog-icon");
				shit.execInsertSrc(icon);
				icon.style.fill = "#33a952";
				icon.style.opacity = 0.5;
	
				page.querySelector("#dialog-title").innerHTML = platform.locale.getLocalizedText("Ready");
				page.querySelector("#dialog-message").innerHTML = platform.locale.getLocalizedText("Choose_what_you_what_from_the_left_menu");
			});
}()

var _ = function () {
	STATE["auto-signin"]()
		.then(
			STATE["ready"],
			STATE["signin-google"],
		);
}()