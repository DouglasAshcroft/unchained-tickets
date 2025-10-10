import { EventStatus } from '@prisma/client';
import { z } from 'zod';

const optionalUrlField = z.union([
  z
    .string()
    .trim()
    .url({ message: 'Invalid URL format' }),
  z.literal(''),
  z.null(),
]).optional();

const optionalIsoDateField = z
  .string()
  .datetime({ message: 'Invalid ISO-8601 datetime string' });

export const EventCreateSchema = z.object({
  title: z.string().trim().min(3, 'Title is required').max(200),
  startsAt: z.string().datetime({ message: 'Invalid ISO-8601 datetime string' }),
  endsAt: z.union([optionalIsoDateField, z.null()]).optional(),
  venueId: z.number().int().positive(),
  primaryArtistId: z.number().int().positive().optional().nullable(),
  posterImageUrl: optionalUrlField,
  externalLink: optionalUrlField,
  mapsLink: optionalUrlField,
  status: z.nativeEnum(EventStatus).optional(),
});

export const EventUpdateSchema = EventCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'Provide at least one field to update',
  }
);

export type EventCreateInput = z.infer<typeof EventCreateSchema>;
export type EventUpdateInput = z.infer<typeof EventUpdateSchema>;
