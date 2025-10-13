import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import {
  VENUE_CHECKLIST_DEFINITIONS,
  MANUAL_CHECKLIST_TASKS,
  CHECKLIST_TASK_IDS,
  ChecklistTaskId,
} from '@/lib/config/venueChecklist';
import { checklistIdToEnum } from '@/lib/utils/venueChecklist';

// TODO: Investigate and fix checklist completion patch flow. Response currently logs "Internal error"
//       when toggling manual tasks. Likely needs auth context and venue scoping.
const paramsSchema = z.object({
  slug: z.string(),
  task: z.enum(CHECKLIST_TASK_IDS),
});

const bodySchema = z.object({
  complete: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ slug: string; task: string }> }
) {
  try {
    const params = paramsSchema.parse(await context.params);

    // Find venue by slug
    const venue = await prisma.venue.findUnique({
      where: { slug: params.slug },
      select: { id: true },
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    const venueId = venue.id;

    const taskId: ChecklistTaskId = params.task;

    if (!MANUAL_CHECKLIST_TASKS.includes(taskId)) {
      return NextResponse.json(
        { error: 'This checklist item is automatically determined and cannot be toggled manually.' },
        { status: 400 }
      );
    }

    const enumTask = checklistIdToEnum(taskId);

    const definition = VENUE_CHECKLIST_DEFINITIONS.find((item) => item.id === taskId);
    if (!definition) {
      return NextResponse.json({ error: 'Unknown checklist item' }, { status: 404 });
    }

    const body = bodySchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: 'Invalid body payload' }, { status: 400 });
    }

    const { complete } = body.data;

    if (complete) {
      await prisma.venueChecklistStatus.upsert({
        where: {
          venueId_task: {
            venueId,
            task: enumTask,
          },
        },
        create: {
          venueId,
          task: enumTask,
          completedAt: new Date(),
        },
        update: {
          completedAt: new Date(),
        },
      });
    } else {
      await prisma.venueChecklistStatus
        .delete({
          where: {
            venueId_task: {
              venueId,
              task: enumTask,
            },
          },
        })
        .catch(() => undefined);
    }

    return NextResponse.json({
      task: taskId,
      complete,
    });
  } catch (error) {
    console.error('Checklist update error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
