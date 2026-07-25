let currentProfile = null;

document.addEventListener("DOMContentLoaded", async () => {
  const loadingEl = document.getElementById("loading");
  const notLinkedinEl = document.getElementById("not-linkedin");
  const profileCardEl = document.getElementById("profile-card");
  const sendBtn = document.getElementById("send-btn");
  const statusMsg = document.getElementById("status-message");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url || !tab.url.includes("linkedin.com/in/")) {
    loadingEl.classList.add("hidden");
    notLinkedinEl.classList.remove("hidden");
    return;
  }

  // Inject content script dynamically if needed and request profile
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_PROFILE" }, (response) => {
      loadingEl.classList.add("hidden");

      if (chrome.runtime.lastError || !response || !response.profile) {
        notLinkedinEl.classList.remove("hidden");
        return;
      }

      currentProfile = response.profile;
      renderProfile(currentProfile);
      profileCardEl.classList.remove("hidden");
    });
  } catch (err) {
    console.error("Scripting error:", err);
    loadingEl.classList.add("hidden");
    notLinkedinEl.classList.remove("hidden");
  }

  sendBtn.addEventListener("click", () => {
    if (!currentProfile) return;

    const stage = document.getElementById("stage-select").value;
    const company = document.getElementById("company-input").value.trim();
    const notes = document.getElementById("notes-input").value.trim();

    const payload = {
      ...currentProfile,
      company: company || currentProfile.company || "",
      stage,
      notes
    };

    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.6";

    chrome.runtime.sendMessage(
      { action: "SAVE_PROFILE_TO_DASHBOARD", profile: payload },
      () => {
        statusMsg.classList.remove("hidden", "error");
        statusMsg.classList.add("success");
        statusMsg.innerText = "✓ Saved & synced to Dashboard!";

        setTimeout(() => {
          window.close();
        }, 1200);
      }
    );
  });
});

function renderProfile(p) {
  document.getElementById("profile-name").innerText = p.name || "LinkedIn Profile";
  document.getElementById("profile-title").innerText = p.title || "No headline extracted";
  document.getElementById("profile-company").innerText = p.company ? `🏢 ${p.company}` : "";
  document.getElementById("company-input").value = p.company || "";

  const avatarImg = document.getElementById("profile-avatar");
  const avatarFallback = document.getElementById("avatar-fallback");

  if (p.avatarUrl) {
    avatarImg.src = p.avatarUrl;
    avatarImg.classList.remove("hidden");
    avatarFallback.classList.add("hidden");
  } else {
    avatarImg.classList.add("hidden");
    avatarFallback.classList.remove("hidden");
  }
}
