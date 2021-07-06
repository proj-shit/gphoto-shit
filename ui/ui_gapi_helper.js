var UI_GAPI_HELPER = function () {
	var authToken = null;
	var scopes = [];

	var evalSandbox = new Sandbox();

	return {
		signIn: function () {
			return DEPENDENCY.wait([{ id: "platform" }])
				.then(() => Promise.all([
					// Get scopes
					DEPENDENCY.wait([{ id: "feature_loader" }])
						.then(() => new Promise(
							resolve => {
								if (FEATURE.list) {
									resolve(FEATURE.list);
									return;
								} else {
									FEATURE.addEventListener("listready", () => {
										resolve(FEATURE.list);
									}, { once: true });
								}
							}
						))
						.then((list) => {
							for (feat of list) {
								scopes.push(...feat.gapi_scope);
							}
							return (scopes = [...new Set(scopes)]);
						}),

					// Get account from tab
					platform.tabs.query({ active: true, currentWindow: true })
						.then(
							([tab]) => new Promise(
								resolve => {
									platform.tabs.sendMessage(tab.id, { getinfo: { get: "_ij" } }, resolve);
								}
							)
						)
						.then(ij => ij + ";IJ_values")
						.then(evalSandbox.eval)
						.then(ij => ({
							email: ij[67],
							id: ij[1][0],
						}))
						.catch(() => { throw "FAIL: Get account from tab"; })
				]))
				.then(([scopes, account]) =>
					new Promise(
						(resolve, reject) => {
							platform.runtime.sendMessage(
								{
									"gapi": {
										"signIn": {
											account: account,
											scopes: scopes,
											interactive: true,
										}
									},
								},
								([authToken, err]) => {
									console.log("authToken", authToken, err);
									if (err) {
										reject(err);
										return;
									}
									resolve();
								},
							);
						}
					)
				)
				.then(
					() => {
						top.document.documentElement.classList.remove("before-sign-in");
					},
					e => {
						console.log("UI_GAPI_HELPER.signIn", "on rejected", e);

						if (e == "FAIL: Get account from tab") {
							refreshTab();
						}

						throw e;
					}
				);
		}
	}
}();