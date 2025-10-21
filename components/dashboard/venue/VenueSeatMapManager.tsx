"use client";

import { useMemo, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api/client";
import type { VenueDashboardSeatMap } from "@/lib/mocks/venueDashboard";

export interface VenueSeatMapManagerProps {
  venueId: number;
  venueSlug: string;
  seatMaps: VenueDashboardSeatMap[];
  onSeatMapCreated: (seatMap: VenueDashboardSeatMap) => void;
}

function buildSeatMapSummary(seatMap: any): VenueDashboardSeatMap {
  const sections = seatMap.sections?.length ?? 0;
  const rows = seatMap.sections?.reduce(
    (sum: number, section: any) => sum + (section.rows?.length ?? 0),
    0
  ) ?? 0;
  const seats = seatMap.sections?.reduce((acc: number, section: any) => {
    return (
      acc +
      (section.rows?.reduce(
        (rowSum: number, row: any) => rowSum + (row.seats?.length ?? 0),
        0
      ) ?? 0)
    );
  }, 0) ?? 0;

  const createdAt =
    typeof seatMap.createdAt === 'string'
      ? seatMap.createdAt
      : new Date(seatMap.createdAt).toISOString();

  return {
    id: seatMap.id,
    name: seatMap.name,
    description: seatMap.description,
    status: seatMap.status,
    version: seatMap.version,
    sections,
    rows,
    seats,
    createdAt,
    structure: seatMap.structure ?? null,
  };
}

export function VenueSeatMapManager({
  venueId: _venueId,
  venueSlug,
  seatMaps,
  onSeatMapCreated,
}: VenueSeatMapManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (payload: { data: unknown }) => {
      return api.createVenueSeatMap(venueSlug, payload.data);
    },
    onSuccess: (response) => {
      const summary = buildSeatMapSummary(response.seatMap);
      onSeatMapCreated(summary);
      toast.success("Seat map uploaded");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error: any) => {
      const message =
        error?.data?.error || error?.message || "Failed to upload seat map";
      toast.error(message);
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const contents = await file.text();
      const parsed = JSON.parse(contents);
      await uploadMutation.mutateAsync({ data: parsed });
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error("Seat map file must be valid JSON");
      } else {
        const message =
          (error as any)?.message || "Failed to process seat map upload";
        toast.error(message);
      }
    }
  };

  const hasSeatMaps = seatMaps.length > 0;
  const mostRecent = useMemo(
    () => seatMaps.slice().sort((a, b) => b.id - a.id),
    [seatMaps]
  );
  const latestSeatMap = mostRecent[0];

  return (
    <Card className="space-y-4 bg-ink-900/70 border-grit-500/30 p-5 shadow-ink">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="brand-heading text-lg text-bone-100">Seat maps</h3>
          <p className="text-xs text-grit-400">
            Upload JSON layouts once and reuse them across every reserved-seating
            event.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="text-xs"
        >
          {uploadMutation.isPending ? 'Uploading…' : 'Upload seat map'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {uploadMutation.isPending && (
        <div className="rounded-lg border border-dashed border-acid-400/40 bg-acid-400/5 p-4">
          <LoadingSpinner size="sm" text="Processing seat map…" />
        </div>
      )}

      {hasSeatMaps ? (
        <div className="space-y-3">
          <div className="rounded-lg border border-grit-500/30 bg-ink-800/40 p-4">
            <p className="text-sm font-medium text-bone-100">Latest seat map preview</p>
            {latestSeatMap?.structure ? (
              <div className="mt-3 max-h-64 overflow-auto rounded border border-grit-500/30 bg-ink-900/60 p-3 text-xs text-grit-200">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(latestSeatMap.structure, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="mt-2 text-xs text-grit-400">
                Structure data not available for this layout.
              </p>
            )}
          </div>

          {mostRecent.map((seatMap) => (
            <div
              key={seatMap.id}
              className="rounded-lg border border-grit-500/30 bg-ink-800/40 p-4 text-sm text-bone-100"
            >
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">{seatMap.name}</p>
                  {seatMap.description && (
                    <p className="text-xs text-grit-400">{seatMap.description}</p>
                  )}
                </div>
                <div className="text-xs text-grit-400">
                  {seatMap.sections} sections · {seatMap.rows} rows · {seatMap.seats} seats
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-grit-400">
                <span className="rounded-full border border-grit-500/40 px-2 py-0.5 uppercase tracking-widest">
                  v{seatMap.version}
                </span>
                <span>
                  Created {new Date(seatMap.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-grit-500/30 bg-ink-800/40 p-4 text-xs text-grit-400">
          No seat maps yet. Upload a JSON layout above to unlock reserved seating
          flows.
        </div>
      )}
    </Card>
  );
}
