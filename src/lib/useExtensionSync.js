import { useEffect } from "react";
import * as store from "./storage";

export function useExtensionSync(onProfileReceived) {
  useEffect(() => {
    // 1. Chrome Extension messaging listener (when content script/extension broadcasts)
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
      const listener = (request) => {
        if (request.action === "SYNC_NEW_PROFILE" && request.profile) {
          handleIncomingProfile(request.profile, onProfileReceived);
        }
      };
      chrome.runtime.onMessage.addListener(listener);
      return () => chrome.runtime.onMessage.removeListener(listener);
    }

    // 2. Window postMessage listener (fallback for cross-frame or tab postMessage)
    const windowListener = (event) => {
      if (event.data && event.data.type === "OUTREACH_TRACKER_ADD_PROFILE" && event.data.profile) {
        handleIncomingProfile(event.data.profile, onProfileReceived);
      }
    };

    // 3. Window storage event listener (for direct localStorage sync across tabs/bridge)
    const storageListener = () => {
      store.getAllContacts().then((contacts) => {
        if (contacts.length > 0 && onProfileReceived) {
          onProfileReceived(contacts[0], true);
        }
      });
    };

    window.addEventListener("message", windowListener);
    window.addEventListener("storage", storageListener);
    return () => {
      window.removeEventListener("message", windowListener);
      window.removeEventListener("storage", storageListener);
    };
  }, [onProfileReceived]);
}

async function handleIncomingProfile(profileData, callback) {
  try {
    const contacts = await store.getAllContacts();
    const existing = contacts.find((c) => c.linkedinUrl && c.linkedinUrl === profileData.linkedinUrl);

    let savedContact;
    if (existing) {
      savedContact = await store.updateContact(existing.id, {
        name: profileData.name || existing.name,
        title: profileData.title || existing.title,
        company: profileData.company || existing.company,
        stage: profileData.stage || existing.stage,
        notes: profileData.notes ? `${existing.notes ? existing.notes + "\n" : ""}${profileData.notes}` : existing.notes,
        avatarUrl: profileData.avatarUrl || existing.avatarUrl,
        updatedAt: new Date().toISOString()
      });
    } else {
      savedContact = await store.createContact({
        name: profileData.name || "LinkedIn Contact",
        title: profileData.title || "",
        company: profileData.company || "",
        linkedinUrl: profileData.linkedinUrl || "",
        stage: profileData.stage || "to_reach_out",
        notes: profileData.notes || "",
        source: "Chrome Extension",
        avatarUrl: profileData.avatarUrl || ""
      });
    }

    if (callback) {
      callback(savedContact, !existing);
    }
  } catch (err) {
    console.error("Failed to process incoming profile from Extension", err);
  }
}
