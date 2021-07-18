ensureLoadComplete()
	.then(() => {
		[...document.querySelectorAll('.mdc-button')].forEach(e => { mdc.ripple.MDCRipple.attachTo(e); });
		[...document.querySelectorAll('.mdc-button__label')].forEach(e => { e.innerHTML = top.FEATURE.locale.getLocalizedText(e.innerHTML); });
	});