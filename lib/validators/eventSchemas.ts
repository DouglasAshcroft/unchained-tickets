import { EventStatus, PricingType } from '@prisma/client';
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

const TicketTypeCreateSchema = z.object({
  name: z.string().trim().min(2, 'Ticket name is required').max(160),
  description: z.string().trim().max(500).optional().nullable(),
  pricingType: z.nativeEnum(PricingType),
  priceCents: z
    .number({ invalid_type_error: 'Provide price in cents as a number' })
    .int('Price must be an integer number of cents')
    .min(0, 'Price cannot be negative')
    .optional()
    .nullable(),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/i, { message: 'Currency must be a 3-letter code' })
    .optional(),
  capacity: z
    .number({ invalid_type_error: 'Capacity must be a whole number' })
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .optional()
    .nullable(),
  salesStart: z.union([optionalIsoDateField, z.null()]).optional(),
  salesEnd: z.union([optionalIsoDateField, z.null()]).optional(),
  isActive: z.boolean().optional(),
});

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
  seatMapId: z.number().int().positive().optional(),
  ticketTypes: z
    .array(TicketTypeCreateSchema)
    .min(1, 'Add at least one ticket type before creating the event'),
});

export const EventUpdateSchema = EventCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'Provide at least one field to update',
  }
);

export type EventCreateInput = z.infer<typeof EventCreateSchema>;
export type EventUpdateInput = z.infer<typeof EventUpdateSchema>;
export type EventTicketTypeInput = z.infer<typeof TicketTypeCreateSchema>;
