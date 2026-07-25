import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as store from "./storage";
import { useExtensionSync } from "./useExtensionSync";

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

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

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
