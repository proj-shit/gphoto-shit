var UI_GAPI_HELPER = function () {
	var authToken = null;
	var scopes = [];

	var evalSandbox = new Sandbox();

	return {
		signIn: function (interactive) {
			interactive = (interactive === undefined) ? true : interactive;
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
							for (const feat of list) {
								scopes.push(...feat.gapi_scope);
							}
							return (scopes = [...new Set(scopes)]);
						}),

					// Get account from tab
					platform.tabs.query({ active: true, currentWindow: true })
						.then(
							([tab]) => new Promise(
								resolve => {
									platform.tabs.sendMessage(tab.id, { "CMD": { "getinfo.get": "_ij" } }, resolve);
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
									"CMD": {
										"gapi.signIn": {
											account: account,
											scopes: scopes,
											interactive: interactive,
										}
									},
								},
								([token, err]) => {
									console.log("authToken", token, err);
									if (err) {
										reject(err);
										return;
									}
									authToken = token;
									resolve();
								},
							);
						}
					)
				)
				.then(
					() => {
						platform.runtime.sendMessage(
							{
								"EVENT": {
									"ui_gapi_helper.onSignIn": {}
								}
							},
							{ sendToLocal: true },
						);
					},
					e => {
						platform.runtime.sendMessage(
							{
								"EVENT": {
									"ui_gapi_helper.onSignInFailed": { error: e.toString() }
								}
							},
							{ sendToLocal: true },
						);
						throw e;
					}
				);
		}
	}
}();