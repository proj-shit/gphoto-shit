import { shit } from '/common/window_utils.js';

shit.ensureLoadComplete()
	// SHIT Replacements
	.then(() => Promise.all([
		async function () {
			shit.execAllLocalize();
		}(),
		shit.execAllInsertSrc(),
	]))
	// MDC Init
	.then(() => {
		mdc.autoInit();
	})

	// UI Setup - Text search
	.then(() => {
		var t = document.querySelector("#text-search").MDCTextField;
		t.foundation.setValidateOnValueChange(true);
		t.foundation.adapter.registerInputInteractionHandler("input", (e) => {
			t.foundation.setValue(e.currentTarget.value);
			e.currentTarget.reportValidity();
		});
		document.querySelector("#text-search-clear-button").addEventListener("click", () => {
			t.foundation.setValue("");
		});
	});