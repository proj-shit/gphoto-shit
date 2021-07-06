_ = function () {
	var SCOPES;

	_ = async function () {	
		// Setup Environment
		Promise.all([
			DEPENDENCY.wait([{ id: "platform" }]).
				then(() => {
					// platform.runtime.sendMessage();
				})
			,
			DEPENDENCY.wait([{ id: "featureloader" }])
				.then(async function () {
					return new Promise(
						resolve => {
							if (FEATURE.list) {
								onFeatureReady().
									then(resolve);
								return;
							} else {
								FEATURE.addEventListener("listready", () => {
									onFeatureReady().
										then(resolve);
								}, { once: true });
							}

							async function onFeatureReady() {
								var scopes = [];
								for (feat of FEATURE.list) {
									scopes.push(...feat.gapi_scope);
								}
								// Authorization scopes required by the API; multiple scopes can be
								// included, separated by spaces.
								SCOPES = [...new Set(scopes)].join(" ");
							}
						}
					)
				})
		])

	}();

	async function connectAccount() {

	}
}();
