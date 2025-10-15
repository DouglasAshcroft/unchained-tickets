"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type {
  VenueDashboardData,
  VenueDashboardSeatMap,
} from "@/lib/mocks/venueDashboard";
import { VenueSeatMapManager } from "@/components/dashboard/venue/VenueSeatMapManager";
import type { ChecklistTaskId } from "@/lib/config/venueChecklist";

interface VenueOnboardingPanelProps {
  venueId: number;
  seatMaps: VenueDashboardSeatMap[];
  checklist: VenueDashboardData["checklist"];
  onboardingProgress: number;
  pendingTaskId: ChecklistTaskId | null;
  onToggleChecklist: (task: ChecklistTaskId, nextComplete: boolean) => void;
  onSeatMapCreated: (seatMap: VenueDashboardSeatMap) => void;
}

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function VenueOnboardingPanel({
  venueId,
  seatMaps,
  checklist,
  onboardingProgress,
  pendingTaskId,
  onToggleChecklist,
  onSeatMapCreated,
}: VenueOnboardingPanelProps) {
  const [collapsed, setCollapsed] = useState(onboardingProgress >= 1);

  useEffect(() => {
    if (onboardingProgress < 1) {
      setCollapsed(false);
    }
  }, [onboardingProgress]);

  const completedCount = useMemo(
    () => checklist.filter((item) => item.complete).length,
    [checklist]
  );

  const onboardingStatus = useMemo(() => {
    if (onboardingProgress === 0) return "incomplete";
    if (onboardingProgress === 1) return "complete";
    return "in_progress";
  }, [onboardingProgress]);

  const helperText =
    onboardingStatus === "complete"
      ? "Onboarding complete. Collapse this section or revisit to review your seat maps."
      : "Work through these steps to unlock payouts, collectibles, and reserved seating.";

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <Card className="space-y-4 border-grit-500/30 bg-ink-900/80 p-6 shadow-ink">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-grit-400">
            Venue onboarding
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <h2 className="brand-heading text-2xl text-bone-100">
              {percentFormatter.format(onboardingProgress)} complete
            </h2>
            <span className="text-xs text-grit-400">
              {completedCount} of {checklist.length} tasks done
            </span>
          </div>
          <p className="mt-2 text-xs text-grit-400">{helperText}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="text-xs"
          onClick={toggleCollapsed}
        >
          {collapsed ? "Expand" : "Collapse"}
        </Button>
      </div>

      {!collapsed && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <VenueSeatMapManager
            venueId={venueId}
            seatMaps={seatMaps}
            onSeatMapCreated={onSeatMapCreated}
          />
          <Checklist
            items={checklist}
            onToggle={onToggleChecklist}
            pendingTaskId={pendingTaskId}
          />
        </div>
      )}
    </Card>
  );
}

interface ChecklistProps {
  items: VenueDashboardData["checklist"];
  onToggle: (task: ChecklistTaskId, nextComplete: boolean) => void;
  pendingTaskId: ChecklistTaskId | null;
}

function Checklist({ items, onToggle, pendingTaskId }: ChecklistProps) {
  return (
    <div className="rounded-xl border border-grit-500/30 bg-ink-900/70 p-5 shadow-ink">
      <h3 className="brand-heading text-lg text-bone-100">
        Onboarding checklist
      </h3>
      <p className="text-xs text-grit-400">
        Complete these to unlock automated collectibles, payouts, and analytics.
      </p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg border border-grit-500/30 bg-ink-800/40 p-4 transition ${
              item.type === "manual"
                ? "hover:border-acid-400/40 cursor-pointer"
                : "opacity-80"
            }`}
            onClick={() => {
              if (item.type !== "manual" || pendingTaskId) return;
              onToggle(item.id, !item.complete);
            }}
            role={item.type === "manual" ? "button" : undefined}
            tabIndex={item.type === "manual" ? 0 : -1}
            onKeyDown={(event) => {
              if (item.type !== "manual" || pendingTaskId) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onToggle(item.id, !item.complete);
              }
            }}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={item.complete}
                disabled={item.type !== "manual" || pendingTaskId === item.id}
                onChange={(event) => {
                  event.stopPropagation();
                  if (item.type !== "manual" || pendingTaskId === item.id)
                    return;
                  onToggle(item.id, event.target.checked);
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-bone-100">
                    {item.label}
                  </p>
                  <span className="rounded-full border border-grit-500/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-grit-400">
                    {item.type === "manual" ? "Manual" : "Auto"}
                  </span>
                </div>
                <p className="text-xs text-grit-400">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
