import { SeatMapStatus } from "@prisma/client";
import { z } from "zod";

const SeatMetadataSchema = z.record(z.any()).optional();

const SeatSchema = z.object({
  seatNumber: z.string().trim().min(1, "Seat number is required"),
  displayLabel: z.string().trim().max(50).optional().nullable(),
  isAccessible: z.boolean().optional(),
  isObstructed: z.boolean().optional(),
  metadata: SeatMetadataSchema,
});

const SeatRowSchema = z.object({
  name: z.string().trim().min(1, "Row name is required").max(100),
  label: z.string().trim().max(25).optional().nullable(),
  sortOrder: z.number().int().optional(),
  metadata: SeatMetadataSchema,
  seats: z.array(SeatSchema).min(1, "Each row must contain at least one seat"),
});

const SeatSectionSchema = z.object({
  name: z.string().trim().min(1, "Section name is required").max(120),
  label: z.string().trim().max(25).optional().nullable(),
  sortOrder: z.number().int().optional(),
  metadata: SeatMetadataSchema,
  rows: z
    .array(SeatRowSchema)
    .min(1, "Each section must contain at least one row with seats"),
});

export const SeatMapCreateSchema = z.object({
  name: z.string().trim().min(1, "Seat map name is required").max(180),
  description: z.string().trim().max(500).optional().nullable(),
  status: z.nativeEnum(SeatMapStatus).optional(),
  version: z.number().int().positive().max(999).optional(),
  sections: z.array(SeatSectionSchema).min(1, "Provide at least one section"),
});

export type SeatMapCreateInput = z.infer<typeof SeatMapCreateSchema>;
export type SeatSectionInput = z.infer<typeof SeatSectionSchema>;
export type SeatRowInput = z.infer<typeof SeatRowSchema>;
export type SeatInput = z.infer<typeof SeatSchema>;
