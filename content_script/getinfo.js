console.log("content_script", "getinfo.js");

platform.runtime.onMessage.addListener((message, sender, respFunc) => {
	// console.log("content_script", "getinfo.js", "onMessage", message);
	if (message["getinfo"]) {
		respFunc(SHIT_INFO[message["getinfo"].get]);
		// console.log("content_script", "getinfo.js", "onMessage:return", SHIT_INFO[message["getinfo"].get]);
		
		return true; // Support async respFunc
	}
});



var SHIT_INFO = {}
SHIT_INFO["_ij"] = document.querySelector("script#_ij").innerHTML;
