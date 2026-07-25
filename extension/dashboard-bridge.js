// Content Script injected into http://localhost/* to bridge Chrome Extension & Outreach Tracker Dashboard

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "SYNC_NEW_PROFILE" && message.profile) {
    // 1. Post message directly to the web page window context
    window.postMessage(
      {
        type: "OUTREACH_TRACKER_ADD_PROFILE",
        profile: message.profile
      },
      "*"
    );

    // 2. Also directly update localStorage for instant persistence
    try {
      const STORAGE_KEY = "outreach-tracker:contacts";
      const raw = localStorage.getItem(STORAGE_KEY);
      const contacts = raw ? JSON.parse(raw) : [];

      const p = message.profile;
      const existingIdx = contacts.findIndex((c) => c.linkedinUrl && c.linkedinUrl === p.linkedinUrl);

      if (existingIdx !== -1) {
        contacts[existingIdx] = {
          ...contacts[existingIdx],
          name: p.name || contacts[existingIdx].name,
          title: p.title || contacts[existingIdx].title,
          company: p.company || contacts[existingIdx].company,
          stage: p.stage || contacts[existingIdx].stage,
          notes: p.notes ? `${contacts[existingIdx].notes ? contacts[existingIdx].notes + "\n" : ""}${p.notes}` : contacts[existingIdx].notes,
          avatarUrl: p.avatarUrl || contacts[existingIdx].avatarUrl,
          updatedAt: new Date().toISOString()
        };
      } else {
        const newContact = {
          id: `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
          name: p.name || "LinkedIn Contact",
          title: p.title || "",
          company: p.company || "",
          linkedinUrl: p.linkedinUrl || "",
          stage: p.stage || "to_reach_out",
          notes: p.notes || "",
          source: "Chrome Extension",
          avatarUrl: p.avatarUrl || "",
          dateFirstContacted: null,
          nextFollowUpDate: null,
          interactions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        contacts.unshift(newContact);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));

      // Trigger custom storage event for all React listeners
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error("Dashboard bridge localStorage write error:", err);
    }

    sendResponse({ success: true });
  }
  return true;
});
