export const CHECKLIST_TASK_VALUES = [
  'seat_map',
  'poster_workflow',
  'staff_accounts',
  'payout_details',
] as const;

export type ChecklistTaskId = (typeof CHECKLIST_TASK_VALUES)[number];

export type ChecklistDefinition = {
  id: ChecklistTaskId;
  label: string;
  description: string;
  type: 'auto' | 'manual';
};

export const VENUE_CHECKLIST_DEFINITIONS: ChecklistDefinition[] = [
  {
    id: 'seat_map',
    label: 'Upload venue seat map',
    description: 'Provide a JSON export so buyers can pick seats during checkout.',
    type: 'auto',
  },
  {
    id: 'poster_workflow',
    label: 'Confirm collectible poster workflow',
    description: 'Upload poster variants or enable generation prompts for each tier.',
    type: 'manual',
  },
  {
    id: 'staff_accounts',
    label: 'Invite venue staff',
    description: 'Add front-of-house and door staff for ticket scanning access.',
    type: 'manual',
  },
  {
    id: 'payout_details',
    label: 'Verify payout details',
    description: 'Connect bank account or Base paymaster address for settlements.',
    type: 'manual',
  },
];

export const MANUAL_CHECKLIST_TASKS = VENUE_CHECKLIST_DEFINITIONS.filter(
  (item) => item.type === 'manual'
).map((item) => item.id);

export const AUTO_CHECKLIST_TASKS = VENUE_CHECKLIST_DEFINITIONS.filter(
  (item) => item.type === 'auto'
).map((item) => item.id);

export const CHECKLIST_TASK_IDS = CHECKLIST_TASK_VALUES;
