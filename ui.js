window.onload = () => {
	ifr = document.querySelector("#feature-iframe"),
	ifr.style.setProperty("--content-height", "0px"),
	ifr.onload = (e) => {
		e.currentTarget.contentWindow.Shared = window.Shared;
		e.currentTarget.style.setProperty("--content-height", e.currentTarget.contentWindow.document.body.clientHeight)
		console.log(e)
	};

	Dependency.wait([{ id: "platform" }]).
	then(() => {
		document.querySelector("style#title-text-style") || 
		(
            style = document.createElement("link"),
            document.head.appendChild(style),
            style.id = "title-text-style",
            style.rel = "stylesheet",
            style.href = "ui.title-bar.css"
		);
		document.querySelector("#title-text-container").innerHTML = platform.locale.getMessage("title_text_element");
	})
}
