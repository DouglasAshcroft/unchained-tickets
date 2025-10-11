import { VenueChecklistTask } from '@prisma/client';
import type { ChecklistTaskId } from '@/lib/config/venueChecklist';

export function checklistIdToEnum(id: ChecklistTaskId): VenueChecklistTask {
  switch (id) {
    case 'seat_map':
      return VenueChecklistTask.seat_map;
    case 'poster_workflow':
      return VenueChecklistTask.poster_workflow;
    case 'staff_accounts':
      return VenueChecklistTask.staff_accounts;
    case 'payout_details':
      return VenueChecklistTask.payout_details;
    default: {
      const exhaustive: never = id;
      throw new Error(`Unknown checklist task id: ${exhaustive}`);
    }
  }
}

export function checklistEnumToId(task: VenueChecklistTask): ChecklistTaskId {
  switch (task) {
    case VenueChecklistTask.seat_map:
      return 'seat_map';
    case VenueChecklistTask.poster_workflow:
      return 'poster_workflow';
    case VenueChecklistTask.staff_accounts:
      return 'staff_accounts';
    case VenueChecklistTask.payout_details:
      return 'payout_details';
    default: {
      const exhaustive: never = task;
      throw new Error(`Unknown checklist task enum: ${exhaustive}`);
    }
  }
}
