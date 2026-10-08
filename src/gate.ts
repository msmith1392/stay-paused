// MAIN-world content script. Runs at document_start in every frame, before page scripts.
// It cannot use chrome.* APIs. Anything it needs from settings is decided at registration time.
//
// Milestone 1 implements the gate here: wrap HTMLMediaElement.prototype.play and add
// capture-phase `play` and `volumechange` listeners. See plans/implementation-plan.md section 2.

export {};
