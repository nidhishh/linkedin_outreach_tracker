let currentProfile = null;

document.addEventListener("DOMContentLoaded", async () => {
  const loadingEl      = document.getElementById("loading");
  const notLinkedinEl  = document.getElementById("not-linkedin");
  const profileCardEl  = document.getElementById("profile-card");
  const sendBtn        = document.getElementById("send-btn");
  const statusMsg      = document.getElementById("status-message");
  const statusDot      = document.getElementById("status-indicator");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url || !tab.url.includes("linkedin.com/in/")) {
    show(loadingEl, false);
    show(notLinkedinEl, true);
    return;
  }

  // Inject content script and request profile extraction
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_PROFILE" }, (response) => {
      show(loadingEl, false);

      if (chrome.runtime.lastError || !response || !response.profile) {
        show(notLinkedinEl, true);
        return;
      }

      currentProfile = response.profile;
      renderProfile(currentProfile);
      show(profileCardEl, true);

      // Mark extension as active
      if (statusDot) statusDot.classList.add("active");
    });
  } catch (err) {
    console.error("Scripting error:", err);
    show(loadingEl, false);
    show(notLinkedinEl, true);
  }

  sendBtn.addEventListener("click", () => {
    if (!currentProfile) return;

    const company = document.getElementById("company-input").value.trim();
    const stage   = document.getElementById("stage-select").value;
    const notes   = document.getElementById("notes-input").value.trim();

    const payload = {
      ...currentProfile,
      company: company || currentProfile.company || "",
      stage,
      notes
    };

    sendBtn.disabled = true;

    chrome.runtime.sendMessage(
      { action: "SAVE_PROFILE_TO_DASHBOARD", profile: payload },
      () => {
        setStatus("✓ Synced to Dashboard!", "success");
        setTimeout(() => window.close(), 1400);
      }
    );
  });
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function show(el, visible) {
  if (!el) return;
  if (visible) {
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}

function setStatus(msg, type) {
  const el = document.getElementById("status-message");
  if (!el) return;
  el.className = `status-msg ${type}`;
  el.textContent = msg;
}

function renderProfile(p) {
  const name    = p.name    || "LinkedIn Profile";
  const title   = p.title   || "";
  const company = p.company || "";

  document.getElementById("profile-name").textContent    = name;
  document.getElementById("profile-title").textContent   = title;
  document.getElementById("profile-company").textContent = company ? `🏢 ${company}` : "";
  document.getElementById("company-input").value         = company;

  // LinkedIn link button
  const liBtn = document.getElementById("profile-link");
  if (liBtn && p.linkedinUrl) {
    liBtn.href = p.linkedinUrl;
  }

  // Avatar
  const avatarImg      = document.getElementById("profile-avatar");
  const avatarFallback = document.getElementById("avatar-fallback");

  if (p.avatarUrl) {
    avatarImg.src = p.avatarUrl;
    avatarImg.onload  = () => { show(avatarImg, true); show(avatarFallback, false); };
    avatarImg.onerror = () => { show(avatarImg, false); show(avatarFallback, true);  };
  }
}
