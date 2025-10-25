"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type {
  VenueDashboardData,
  VenueDashboardSeatMap,
} from "@/lib/mocks/venueDashboard";
import { VenueSeatMapManager } from "@/components/dashboard/venue/VenueSeatMapManager";
import PosterWorkflowManager from "@/components/dashboard/venue/PosterWorkflowManager";
import type { ChecklistTaskId } from "@/lib/config/venueChecklist";

interface VenueOnboardingPanelProps {
  venueId: number;
  venueSlug: string;
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

interface EventForPosterGeneration {
  id: number;
  title: string;
  ticketTypes: Array<{
    id: number;
    name: string;
    priceCents: number | null;
  }>;
}

export function VenueOnboardingPanel({
  venueId,
  venueSlug,
  seatMaps,
  checklist,
  onboardingProgress,
  pendingTaskId,
  onToggleChecklist,
  onSeatMapCreated,
}: VenueOnboardingPanelProps) {
  const [collapsed, setCollapsed] = useState(onboardingProgress >= 1);
  const [expandedWorkflow, setExpandedWorkflow] = useState<'seat_map' | 'poster_workflow' | null>(null);
  const [events, setEvents] = useState<EventForPosterGeneration[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (onboardingProgress < 1) {
      setCollapsed(false);
    }
  }, [onboardingProgress]);

  // Fetch events when poster workflow is expanded
  useEffect(() => {
    if (expandedWorkflow === 'poster_workflow' && events.length === 0) {
      setLoadingEvents(true);
      fetch(`/api/events?venueId=${venueId}`)
        .then(res => res.json())
        .then(data => {
          setEvents(data.events || []);
          // Auto-select first event if available
          if (data.events && data.events.length > 0) {
            setSelectedEventId(data.events[0].id);
          }
        })
        .catch(error => {
          console.error('Failed to fetch events:', error);
        })
        .finally(() => {
          setLoadingEvents(false);
        });
    }
  }, [expandedWorkflow, venueId, events.length]);

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
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <VenueSeatMapManager
              venueId={venueId}
              venueSlug={venueSlug}
              seatMaps={seatMaps}
              onSeatMapCreated={onSeatMapCreated}
            />
            <Checklist
              items={checklist}
              onToggle={onToggleChecklist}
              pendingTaskId={pendingTaskId}
              expandedWorkflow={expandedWorkflow}
              onToggleWorkflow={setExpandedWorkflow}
            />
          </div>

          {/* Poster Workflow Manager - shown when poster_workflow is expanded */}
          {expandedWorkflow === 'poster_workflow' && (
            <div className="rounded-xl border border-indigo-500/30 bg-ink-900/70 p-6 shadow-ink space-y-6">
              {/* Event Selector */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-bone-100">
                  Select Event for Poster Generation
                </label>
                {loadingEvents ? (
                  <div className="text-sm text-grit-400">Loading events...</div>
                ) : events.length === 0 ? (
                  <div className="rounded-lg border border-resistance-500/30 bg-resistance-500/5 p-4">
                    <p className="text-sm text-bone-100">No events found</p>
                    <p className="text-xs text-grit-400 mt-1">
                      Create an event first to generate collectible posters
                    </p>
                  </div>
                ) : (
                  <select
                    value={selectedEventId ?? ''}
                    onChange={(e) => setSelectedEventId(Number(e.target.value))}
                    className="w-full rounded-lg border border-grit-500/30 bg-ink-800 px-4 py-3 text-bone-100 focus:border-acid-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50"
                  >
                    {events.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.title} ({event.ticketTypes?.length || 0} ticket tiers)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Poster Workflow Manager */}
              {selectedEventId && events.length > 0 && (
                <PosterWorkflowManager
                  eventId={selectedEventId}
                  venueId={venueId}
                  event={events.find(e => e.id === selectedEventId)}
                />
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

interface ChecklistProps {
  items: VenueDashboardData["checklist"];
  onToggle: (task: ChecklistTaskId, nextComplete: boolean) => void;
  pendingTaskId: ChecklistTaskId | null;
  expandedWorkflow: 'seat_map' | 'poster_workflow' | null;
  onToggleWorkflow: (workflow: 'seat_map' | 'poster_workflow' | null) => void;
}

function Checklist({ items, onToggle, pendingTaskId, expandedWorkflow, onToggleWorkflow }: ChecklistProps) {
  return (
    <div className="rounded-xl border border-grit-500/30 bg-ink-900/70 p-5 shadow-ink">
      <h3 className="brand-heading text-lg text-bone-100">
        Onboarding checklist
      </h3>
      <p className="text-xs text-grit-400">
        Complete these to unlock automated collectibles, payouts, and analytics.
      </p>
      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const isWorkflowTask = item.id === 'poster_workflow' || item.id === 'seat_map';
          const isExpanded = expandedWorkflow === item.id;

          return (
          <div
            key={item.id}
            className={`rounded-lg border p-4 transition ${
              isExpanded
                ? "border-indigo-400 bg-ink-800/60"
                : item.type === "manual"
                ? "border-grit-500/30 bg-ink-800/40 hover:border-acid-400/40 cursor-pointer"
                : "border-grit-500/30 bg-ink-800/40 opacity-80"
            }`}
            onClick={() => {
              if (pendingTaskId) return;
              if (isWorkflowTask) {
                onToggleWorkflow(isExpanded ? null : item.id as 'seat_map' | 'poster_workflow');
              } else if (item.type === "manual") {
                onToggle(item.id, !item.complete);
              }
            }}
            role={item.type === "manual" || isWorkflowTask ? "button" : undefined}
            tabIndex={item.type === "manual" || isWorkflowTask ? 0 : -1}
            onKeyDown={(event) => {
              if (pendingTaskId) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (isWorkflowTask) {
                  onToggleWorkflow(isExpanded ? null : item.id as 'seat_map' | 'poster_workflow');
                } else if (item.type === "manual") {
                  onToggle(item.id, !item.complete);
                }
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
                  {isWorkflowTask && (
                    <span className="text-xs text-indigo-400">
                      {isExpanded ? "▼ Expanded" : "▶ Click to expand"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-grit-400">{item.description}</p>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
