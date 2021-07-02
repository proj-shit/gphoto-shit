window.onload = () => {
	document.querySelector("#feature-iframe").onload = (e) => {
		e.target.contentWindow.Shared = window.Shared;
		e.target.setProperty("--content-height", e.target.contentWindow.document.body.clientHeight)
		console.log(e)
	}
	//DEBUG
	// document.querySelector("#feature-iframe").contentWindow.document.body.style.background = "linear-gradient(30deg, red, blue)"
}