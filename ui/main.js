ensureLoadComplete().
then(() => {
	document.querySelector("#page-signin-google").style.display = "block";
	document.querySelector("#signin-button").onclick = () => {
		var signInPage = document.querySelector("#page-signin-google")
		signInPage.style.display = "none";
		top.UI_GAPI_HELPER.signIn()
		.then(() => {
			console.log("main", "resolved");
		}, 
		() => {
			console.log("main", "rejected");
			signInPage.style.display = "block";
		});
	};
});

