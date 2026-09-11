// Service Worker for LinkedIn Outreach Tracker Extension

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SAVE_PROFILE_TO_DASHBOARD") {
    const profile = message.profile;

    // 1. Store in extension local storage for history
    chrome.storage.local.get({ capturedProfiles: [] }, (result) => {
      const existing = result.capturedProfiles || [];
      const updated = [profile, ...existing.filter(p => p.linkedinUrl !== profile.linkedinUrl)];
      chrome.storage.local.set({ capturedProfiles: updated });
    });

    // 2. Broadcast to all open dashboard tabs across supported domains
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        // Match both local development tabs (localhost/127.0.0.1) and
        // the hosted production dashboard on GitHub Pages (github.io)
        const isDashboardTab =
          tab.url &&
          (tab.url.includes("localhost") ||
            tab.url.includes("127.0.0.1") ||
            tab.url.includes("github.io"));

        if (isDashboardTab) {
          // Send the captured LinkedIn profile directly into the tab's dashboard-bridge.js
          chrome.tabs.sendMessage(tab.id, {
            action: "SYNC_NEW_PROFILE",
            profile: profile
          }).catch(() => {
            // Ignore errors if the tab is still loading or hasn't finished registering listeners
          });
        }
      });
    });

    sendResponse({ status: "SUCCESS" });
  }
  return true;
});
