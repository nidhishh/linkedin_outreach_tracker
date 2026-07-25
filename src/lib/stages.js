// Pipeline stage definitions. Order matters — it's the literal sequence
// a relationship moves through, so indices double as step numbers.
export const STAGES = [
  {
    id: "to_reach_out",
    label: "To Reach Out",
    short: "New",
    color: "ink",
    dot: "#6B7268",
  },
  {
    id: "message_sent",
    label: "Message Sent",
    short: "Sent",
    color: "brass",
    dot: "#A97C3F",
  },
  {
    id: "in_conversation",
    label: "In Conversation",
    short: "Talking",
    color: "teal",
    dot: "#2B5C5E",
  },
  {
    id: "follow_up_needed",
    label: "Follow-Up Needed",
    short: "Follow up",
    color: "rust",
    dot: "#A2463A",
  },
  {
    id: "meeting_scheduled",
    label: "Meeting Scheduled",
    short: "Meeting",
    color: "teal",
    dot: "#3F7A7C",
  },
  {
    id: "converted",
    label: "Converted",
    short: "Won",
    color: "sage",
    dot: "#5C7A54",
  },
  {
    id: "cold",
    label: "Cold / No Response",
    short: "Cold",
    color: "ink",
    dot: "#9B9F92",
  },
  {
    id: "archived",
    label: "Archived",
    short: "Archived",
    color: "ink",
    dot: "#C7C2B4",
  },
];

export const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.id, s]));

export const DEFAULT_STAGE = STAGES[0].id;

export function stageIndex(stageId) {
  return STAGES.findIndex((s) => s.id === stageId);
}

export const INTERACTION_TYPES = [
  "Connection request sent",
  "Message sent",
  "They replied",
  "Call / meeting",
  "Note",
  "Other",
];

export const SOURCE_OPTIONS = [
  "Cold outreach",
  "Warm intro",
  "Inbound",
  "Event / conference",
  "Mutual group",
  "Other",
];
