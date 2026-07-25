// Persistence layer.
//
// Every function here is async and returns plain data, deliberately shaped
// like a small API client rather than a direct localStorage wrapper. That
// means the rest of the app never touches `localStorage` directly — so this
// file is the one place to change if the tracker ever moves to a real
// backend, or gets fed by a browser extension capturing LinkedIn profiles.

const STORAGE_KEY = "outreach-tracker:contacts";

function uid() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read contacts from storage", err);
    return [];
  }
}

function writeAll(contacts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    return true;
  } catch (err) {
    console.error("Failed to save contacts to storage", err);
    return false;
  }
}

// Simulate async I/O so swapping this for real network calls later is a
// non-breaking change for callers.
function tick() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function getAllContacts() {
  await tick();
  return readAll();
}

export async function getContact(id) {
  await tick();
  return readAll().find((c) => c.id === id) || null;
}

export async function createContact(data) {
  await tick();
  const contacts = readAll();
  const now = new Date().toISOString();
  const contact = {
    id: uid(),
    name: "",
    linkedinUrl: "",
    company: "",
    title: "",
    tags: [],
    stage: "to_reach_out",
    source: "",
    dateFirstContacted: null,
    nextFollowUpDate: null,
    notes: "",
    interactions: [],
    createdAt: now,
    updatedAt: now,
    ...data,
  };
  contacts.unshift(contact);
  writeAll(contacts);
  return contact;
}

export async function updateContact(id, patch) {
  await tick();
  const contacts = readAll();
  const idx = contacts.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Contact ${id} not found`);
  contacts[idx] = {
    ...contacts[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeAll(contacts);
  return contacts[idx];
}

export async function deleteContact(id) {
  await tick();
  const contacts = readAll().filter((c) => c.id !== id);
  writeAll(contacts);
  return true;
}

export async function addInteraction(contactId, interaction) {
  await tick();
  const contacts = readAll();
  const idx = contacts.findIndex((c) => c.id === contactId);
  if (idx === -1) throw new Error(`Contact ${contactId} not found`);
  const entry = {
    id: uid(),
    date: interaction.date || new Date().toISOString().slice(0, 10),
    type: interaction.type || "Note",
    notes: interaction.notes || "",
    createdAt: new Date().toISOString(),
  };
  const interactions = [...(contacts[idx].interactions || []), entry].sort(
    (a, b) => (a.date < b.date ? 1 : -1)
  );
  contacts[idx] = {
    ...contacts[idx],
    interactions,
    updatedAt: new Date().toISOString(),
  };
  writeAll(contacts);
  return contacts[idx];
}

export async function deleteInteraction(contactId, interactionId) {
  await tick();
  const contacts = readAll();
  const idx = contacts.findIndex((c) => c.id === contactId);
  if (idx === -1) throw new Error(`Contact ${contactId} not found`);
  contacts[idx] = {
    ...contacts[idx],
    interactions: (contacts[idx].interactions || []).filter(
      (i) => i.id !== interactionId
    ),
    updatedAt: new Date().toISOString(),
  };
  writeAll(contacts);
  return contacts[idx];
}

// Derived helper: most recent interaction date for a contact.
export function lastInteractionDate(contact) {
  if (!contact.interactions || contact.interactions.length === 0) {
    return contact.dateFirstContacted || null;
  }
  return contact.interactions.reduce(
    (latest, i) => (!latest || i.date > latest ? i.date : latest),
    null
  );
}

export async function exportData() {
  await tick();
  return JSON.stringify(readAll(), null, 2);
}

export async function importData(json) {
  await tick();
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) throw new Error("Invalid import file");
  writeAll(parsed);
  return parsed;
}
