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
    // Track how many follow-up attempts have been sent (Cadence tracker)
    followUpCount: 0,
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

// Deletes a single contact by ID from localStorage
export async function deleteContact(id) {
  await tick();
  const contacts = readAll().filter((c) => c.id !== id);
  writeAll(contacts);
  return true;
}

// Deletes multiple contacts in a single batch operation for performance and atomicity
export async function deleteMultipleContacts(ids) {
  await tick();
  const idSet = new Set(ids);
  // Filter out any contact whose ID is contained in the selected set
  const contacts = readAll().filter((c) => !idSet.has(c.id));
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

// Imports contact data from a JSON string. Supports:
// 1. Raw contact arrays: [ { id, name, ... }, ... ]
// 2. Extension storage exports: { capturedProfiles: [ ... ] }
// 3. Nested backups: { contacts: [ ... ] }
export async function importData(json) {
  await tick();
  const parsed = JSON.parse(json);

  // Extract the contacts list regardless of wrapper format
  let list = [];
  if (Array.isArray(parsed)) {
    list = parsed;
  } else if (parsed && typeof parsed === "object") {
    if (Array.isArray(parsed.capturedProfiles)) {
      list = parsed.capturedProfiles;
    } else if (Array.isArray(parsed.contacts)) {
      list = parsed.contacts;
    }
  }

  // If no valid list was found, reject with an error
  if (!Array.isArray(list) || list.length === 0 && !Array.isArray(parsed)) {
    throw new Error("Invalid import file format");
  }

  // Normalize each profile to guarantee valid contact schema properties
  const normalized = list.map((item, index) => {
    const now = item.capturedAt || item.createdAt || new Date().toISOString();
    return {
      // Ensure unique ID exists
      id: item.id || `c_${(Date.now() - index * 1000).toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      name: item.name || "LinkedIn Contact",
      title: item.title || "",
      company: item.company || "",
      linkedinUrl: item.linkedinUrl || "",
      stage: item.stage || "to_reach_out",
      notes: item.notes || "",
      source: item.source || "Chrome Extension",
      avatarUrl: item.avatarUrl || "",
      tags: Array.isArray(item.tags) ? item.tags : [],
      dateFirstContacted: item.dateFirstContacted || null,
      nextFollowUpDate: item.nextFollowUpDate || null,
      followUpCount: typeof item.followUpCount === "number" ? item.followUpCount : 0,
      interactions: Array.isArray(item.interactions) ? item.interactions : [],
      createdAt: item.createdAt || now,
      updatedAt: item.updatedAt || now,
      ...item,
    };
  });

  // Write the normalized contacts array into localStorage
  writeAll(normalized);
  return normalized;
}

