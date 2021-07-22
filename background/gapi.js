console.log("background", "gapi.js");

import platform from "/common/platform.js";

try {

	platform.runtime.onMessage.addListener((message, sender, respFunc) => {
		if (message["CMD"]) {
			var m;
			if (m = message["CMD"]["gapi.signIn"]) {
				signIn(
					m.account,
					m.scopes,
					m.interactive === undefined ? false : m.interactive,
				)
					.then(
						r => {
							respFunc([r]);
						},
						e => {
							respFunc([undefined, e]);
						}
					)
				return true;
			}
		}
	});

	async function signIn(account, scopes, interactive) {
		return new Promise(
			(resolve, reject) => {
				platform.identity.getAuthToken(
					{
						account: { id: account.id },
						interactive: interactive,
						scopes: scopes,
					},
					token => {
						(token ? resolve({ authToken: token }) : reject("No token"));
					}
				);
			}
		)
	}

} catch (error) {
	console.error(error)
}