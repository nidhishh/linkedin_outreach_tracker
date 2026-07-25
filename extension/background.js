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

    // 2. Broadcast to open dashboard tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.url && (tab.url.includes("localhost") || tab.url.includes("127.0.0.1"))) {
          chrome.tabs.sendMessage(tab.id, {
            action: "SYNC_NEW_PROFILE",
            profile: profile
          }).catch(() => {
            // Ignore errors if tab isn't listening
          });
        }
      });
    });

    sendResponse({ status: "SUCCESS" });
  }
  return true;
});
