// LinkedIn Profile Content Script for Outreach Tracker

function extractLinkedInProfile() {
  const url = window.location.href.split("?")[0].split("#")[0];

  // 1. Extract Name
  let name = "";
  const nameSelectors = [
    "h1.text-heading-xlarge",
    ".pv-text-details__left-panel h1",
    "[data-anonymize='person-name']",
    "main section h1",
    ".top-card-layout__title",
    "h1"
  ];
  for (const sel of nameSelectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText && el.innerText.trim()) {
      const clean = el.innerText.split("\n")[0].trim();
      if (clean && clean.length < 60) {
        name = clean;
        break;
      }
    }
  }

  // Fallback name from document title
  if (!name && document.title) {
    const titleParts = document.title.split("|");
    if (titleParts[0]) {
      name = titleParts[0].replace(/\(\d+\)/, "").trim();
    }
  }

  // 2. Extract Title / Headline
  let title = "";
  const titleSelectors = [
    ".text-body-medium.break-words",
    ".pv-text-details__left-panel .text-body-medium",
    "div.text-body-medium",
    ".top-card-layout__headline",
    "h2.top-card-layout__headline"
  ];
  for (const sel of titleSelectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText && el.innerText.trim()) {
      title = el.innerText.trim();
      break;
    }
  }

  // 3. Extract Location
  let location = "";
  const locSelectors = [
    ".text-body-small.inline.t-black--light.break-words",
    ".pv-text-details__left-panel span.text-body-small",
    ".top-card-layout__first-subline"
  ];
  for (const sel of locSelectors) {
    const el = document.querySelector(sel);
    if (el && el.innerText && el.innerText.trim()) {
      location = el.innerText.trim();
      break;
    }
  }

  // 4. Extract Company (Multi-strategy)
  let company = "";

  // Strategy A: DOM Top Card company links or badges
  const companyDomSelectors = [
    "a[href*='/company/']",
    "button[aria-label*='Current company']",
    "a[aria-label*='Current company']",
    ".pv-text-details__right-panel li button",
    ".pv-text-details__right-panel li a",
    ".pv-text-details__right-panel li"
  ];

  for (const sel of companyDomSelectors) {
    const els = document.querySelectorAll(sel);
    for (const el of els) {
      if (el && el.innerText && el.innerText.trim()) {
        const text = el.innerText.split("\n")[0].trim();
        // Ignore school/education terms if possible
        if (text && !text.toLowerCase().includes("university") && !text.toLowerCase().includes("college") && !text.toLowerCase().includes("school")) {
          company = text;
          break;
        }
      }
    }
    if (company) break;
  }

  // Strategy B: Parsing from Title/Headline if DOM strategy returned empty or education
  if (!company && title) {
    if (title.includes(" at ")) {
      company = title.split(" at ")[1].split("|")[0].split("•")[0].split("-")[0].trim();
    } else if (title.includes(" @ ")) {
      company = title.split(" @ ")[1].split("|")[0].split("•")[0].split("-")[0].trim();
    } else if (title.includes(" | ")) {
      const parts = title.split(" | ");
      if (parts.length > 1) {
        company = parts[1].trim();
      }
    } else if (title.includes(" - ")) {
      const parts = title.split(" - ");
      if (parts.length > 1) {
        company = parts[1].trim();
      }
    } else if (title.includes(" • ")) {
      const parts = title.split(" • ");
      if (parts.length > 1) {
        company = parts[1].trim();
      }
    }
  }

  // Strategy C: Check Experience Section if DOM/Headline didn't yield result
  if (!company) {
    const expSection = document.querySelector("#experience");
    if (expSection) {
      const expCompanyEl = expSection.querySelector("span.t-14.t-normal span[aria-hidden='true']") ||
                           expSection.querySelector(".pvs-entity__secondary-title span[aria-hidden='true']");
      if (expCompanyEl && expCompanyEl.innerText) {
        company = expCompanyEl.innerText.split("·")[0].trim();
      }
    }
  }

  // 5. Extract Avatar Image
  let avatar = "";
  const imgEl =
    document.querySelector("img.pv-top-card-profile-picture__image") ||
    document.querySelector("img.pv-top-card-profile-picture__image--show") ||
    document.querySelector(".profile-photo-edit__preview") ||
    document.querySelector("img.pv-top-card__photo");

  if (imgEl && imgEl.src && !imgEl.src.startsWith("data:")) {
    avatar = imgEl.src;
  }

  return {
    name: name || "LinkedIn Member",
    title: title || "",
    company: company || "",
    location: location || "",
    linkedinUrl: url,
    avatarUrl: avatar,
    source: "Chrome Extension",
    stage: "to_reach_out",
    capturedAt: new Date().toISOString()
  };
}

// Listen for messages from popup or background service worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_PROFILE") {
    const profile = extractLinkedInProfile();
    sendResponse({ success: true, profile });
  }
  return true;
});
