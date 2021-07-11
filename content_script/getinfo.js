console.log("content_script", "getinfo.js");

platform.runtime.onMessage.addListener((message, sender, respFunc) => {
	if (message["CMD"]) {
		if (m = message["CMD"]["getinfo.get"]) {
			respFunc(SHIT_INFO[message["CMD"]["getinfo.get"]]);

			return true; // Support async respFunc
		}
	}
});



var SHIT_INFO = {}
SHIT_INFO["_ij"] = document.querySelector("script#_ij").innerHTML;
