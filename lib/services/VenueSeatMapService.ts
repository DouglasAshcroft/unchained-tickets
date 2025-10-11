import type { Prisma } from '@prisma/client';
import { SeatMapStatus, VenueChecklistTask } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import {
  SeatInput,
  SeatMapCreateInput,
  SeatRowInput,
  SeatSectionInput,
} from '@/lib/validators/seatMapSchemas';

const toJsonValue = (value?: Record<string, unknown> | null): Prisma.JsonValue | undefined => {
  if (!value) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.JsonValue;
};

const sanitizeSeat = (seat: SeatInput, fallbackOrder: number) => ({
  seatNumber: seat.seatNumber.trim(),
  displayLabel: seat.displayLabel?.trim() ?? null,
  isAccessible: seat.isAccessible ?? false,
  isObstructed: seat.isObstructed ?? false,
  metadata: toJsonValue(seat.metadata ?? null),
  sortOrder: fallbackOrder,
});

const sanitizeRow = (row: SeatRowInput, fallbackOrder: number) => ({
  name: row.name.trim(),
  label: row.label?.trim() ?? null,
  sortOrder: row.sortOrder ?? fallbackOrder,
  metadata: toJsonValue(row.metadata ?? null),
  seats: row.seats.map((seat, index) => sanitizeSeat(seat, index)),
});

const sanitizeSection = (section: SeatSectionInput, fallbackOrder: number) => ({
  name: section.name.trim(),
  label: section.label?.trim() ?? null,
  sortOrder: section.sortOrder ?? fallbackOrder,
  metadata: toJsonValue(section.metadata ?? null),
  rows: section.rows.map((row, index) => sanitizeRow(row, index)),
});

class VenueSeatMapService {
  async listSeatMapsForVenue(venueId: number) {
    const seatMaps = await prisma.venueSeatMap.findMany({
      where: { venueId },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        sections: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          include: {
            rows: {
              orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
              include: {
                seats: {
                  orderBy: [{ sortOrder: 'asc' }, { seatNumber: 'asc' }],
                },
              },
            },
          },
        },
      },
    });

    return seatMaps.map((seatMap) => {
      const summary = seatMap.sections.reduce(
        (acc, section) => {
          acc.sections += 1;
          acc.rows += section.rows.length;
          for (const row of section.rows) {
            acc.seats += row.seats.length;
          }
          return acc;
        },
        { sections: 0, rows: 0, seats: 0 }
      );

      return {
        id: seatMap.id,
        venueId: seatMap.venueId,
        name: seatMap.name,
        description: seatMap.description,
        status: seatMap.status,
        version: seatMap.version,
        structure: seatMap.structure,
        createdAt: seatMap.createdAt,
        updatedAt: seatMap.updatedAt,
        summary,
        sections: seatMap.sections.map((section) => ({
          id: section.id,
          name: section.name,
          label: section.label,
          sortOrder: section.sortOrder,
          metadata: section.metadata,
          rows: section.rows.map((row) => ({
            id: row.id,
            name: row.name,
            label: row.label,
            sortOrder: row.sortOrder,
            metadata: row.metadata,
            seats: row.seats.map((seat) => ({
              id: seat.id,
              seatNumber: seat.seatNumber,
              displayLabel: seat.displayLabel,
              isAccessible: seat.isAccessible,
              isObstructed: seat.isObstructed,
              metadata: seat.metadata,
              sortOrder: seat.sortOrder,
            })),
          })),
        })),
      };
    });
  }

  async getSeatMapById(id: number) {
    const seatMap = await prisma.venueSeatMap.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
          include: {
            rows: {
              orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
              include: {
                seats: {
                  orderBy: [{ sortOrder: 'asc' }, { seatNumber: 'asc' }],
                },
              },
            },
          },
        },
      },
    });

    if (!seatMap) {
      return null;
    }

    return seatMap;
  }

  async createSeatMap(venueId: number, payload: SeatMapCreateInput) {
    const sanitizedSections = payload.sections.map((section, index) =>
      sanitizeSection(section, index)
    );

    const structure = {
      name: payload.name.trim(),
      version: payload.version ?? 1,
      sections: sanitizedSections.map((section) => ({
        name: section.name,
        label: section.label,
        sortOrder: section.sortOrder,
        rows: section.rows.map((row) => ({
          name: row.name,
          label: row.label,
          sortOrder: row.sortOrder,
          seats: row.seats.map((seat) => ({
            seatNumber: seat.seatNumber,
            displayLabel: seat.displayLabel,
            sortOrder: seat.sortOrder,
            isAccessible: seat.isAccessible,
            isObstructed: seat.isObstructed,
          })),
        })),
      })),
    };

    const result = await prisma.$transaction(async (tx) => {
      const seatMap = await tx.venueSeatMap.create({
        data: {
          venueId,
          name: payload.name.trim(),
          description: payload.description?.trim() ?? null,
          status: payload.status ?? SeatMapStatus.draft,
          version: payload.version ?? 1,
          structure: structure as Prisma.JsonValue,
        },
      });

      for (const section of sanitizedSections) {
        const sectionRecord = await tx.seatSection.create({
          data: {
            seatMapId: seatMap.id,
            name: section.name,
            label: section.label,
            sortOrder: section.sortOrder,
            metadata: section.metadata,
          },
        });

        for (const row of section.rows) {
          const rowRecord = await tx.seatRow.create({
            data: {
              sectionId: sectionRecord.id,
              name: row.name,
              label: row.label,
              sortOrder: row.sortOrder,
              metadata: row.metadata,
            },
          });

          if (row.seats.length === 0) {
            throw new Error(`Row ${row.name} must include at least one seat`);
          }

          await tx.seatPosition.createMany({
            data: row.seats.map((seat) => ({
              rowId: rowRecord.id,
              seatNumber: seat.seatNumber,
              displayLabel: seat.displayLabel,
              isAccessible: seat.isAccessible,
              isObstructed: seat.isObstructed,
              metadata: seat.metadata,
              sortOrder: seat.sortOrder,
            })),
          });
        }
      }

      await tx.venueChecklistStatus.upsert({
        where: {
          venueId_task: {
            venueId,
            task: VenueChecklistTask.seat_map,
          },
        },
        create: {
          venueId,
          task: VenueChecklistTask.seat_map,
          completedAt: new Date(),
        },
        update: {
          completedAt: new Date(),
        },
      });

      return seatMap;
    });

    return this.getSeatMapById(result.id);
  }
}

export const venueSeatMapService = new VenueSeatMapService();
