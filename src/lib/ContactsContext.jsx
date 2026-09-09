import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as store from "./storage";
import { useExtensionSync } from "./useExtensionSync";
import { addDays, todayStr, formatDateShort } from "./dateUtils";

const ContactsContext = createContext(null);

export function ContactsProvider({ children }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await store.getAllContacts();
    setContacts(all);
    return all;
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const addContact = useCallback(
    async (data) => {
      const contact = await store.createContact(data);
      await refresh();
      return contact;
    },
    [refresh]
  );

  const editContact = useCallback(
    async (id, patch) => {
      const contact = await store.updateContact(id, patch);
      await refresh();
      return contact;
    },
    [refresh]
  );

  const removeContact = useCallback(
    async (id) => {
      await store.deleteContact(id);
      await refresh();
    },
    [refresh]
  );

  const [toast, setToast] = useState(null);

  // Displays lightweight toast notification on the bottom-right
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Batch removes multiple contacts at once and triggers a single state reload
  const removeMultipleContacts = useCallback(
    async (ids) => {
      await store.deleteMultipleContacts(ids);
      await refresh();
      showToast(`Deleted ${ids.length} ${ids.length === 1 ? "contact" : "contacts"}`);
    },
    [refresh, showToast]
  );

  // Bumps follow-up date by N days from today with instant feedback
  const quickBumpFollowUp = useCallback(
    async (contactId, days) => {
      const newDate = addDays(todayStr(), days);
      await store.updateContact(contactId, { nextFollowUpDate: newDate });
      await refresh();
      showToast(`⚡ Rescheduled to ${formatDateShort(newDate)} (+${days}d)`);
    },
    [refresh, showToast]
  );

  // Completes a follow-up attempt: logs interaction, bumps cadence count, sets next date
  const markFollowedUp = useCallback(
    async (contactId, nextDays = 4) => {
      const contact = contacts.find((c) => c.id === contactId);
      const currentCount = (contact?.followUpCount || 0) + 1;
      const newNextDate = addDays(todayStr(), nextDays);

      // 1. Log interaction into timeline history
      await store.addInteraction(contactId, {
        type: "Follow-up",
        notes: `Follow-up #${currentCount} sent. Next check-in scheduled for ${formatDateShort(newNextDate)}.`,
        date: todayStr(),
      });

      // 2. Update contact cadence status and next follow-up date
      await store.updateContact(contactId, {
        followUpCount: currentCount,
        nextFollowUpDate: newNextDate,
        stage: contact?.stage === "to_reach_out" ? "message_sent" : (contact?.stage || "message_sent"),
      });

      await refresh();
      showToast(`✅ Logged Follow-up #${currentCount} for ${contact?.name || "contact"}!`);
    },
    [contacts, refresh, showToast]
  );

  const logInteraction = useCallback(
    async (contactId, interaction) => {
      const contact = await store.addInteraction(contactId, interaction);
      await refresh();
      return contact;
    },
    [refresh]
  );

  const removeInteraction = useCallback(
    async (contactId, interactionId) => {
      await store.deleteInteraction(contactId, interactionId);
      await refresh();
    },
    [refresh]
  );

  useExtensionSync(
    useCallback(
      (contact, isNew) => {
        refresh();
        showToast(
          isNew
            ? `✨ New profile loaded from Extension: ${contact.name}`
            : `🔄 Profile updated from Extension: ${contact.name}`
        );
      },
      [refresh, showToast]
    )
  );

  const value = {
    contacts,
    loading,
    toast,
    showToast,
    refresh,
    addContact,
    editContact,
    removeContact,
    // Batch deletion for multi-select contact cleanup
    removeMultipleContacts,
    // 1-Click date rescheduling helpers
    quickBumpFollowUp,
    // Cadence progression helper
    markFollowedUp,
    logInteraction,
    removeInteraction,
  };

  return (
    <ContactsContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-surface border border-brass/40 shadow-2xl px-5 py-3.5 rounded-lg text-ink animate-bounce-short">
          <span className="text-brass text-lg">⚡</span>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const ctx = useContext(ContactsContext);
  if (!ctx) throw new Error("useContacts must be used within ContactsProvider");
  return ctx;
}
