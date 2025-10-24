'use client';

import { useState } from 'react';
import type { TicketTypeForm, TicketPerkForm, FormErrors } from '../../types';

export interface TicketTypeCardHandlers {
  onUpdate: (ticketId: string, field: keyof TicketTypeForm, value: string) => void;
  onRemove: (ticketId: string) => void;
  onAddPerk: (ticketId: string) => void;
  onUpdatePerk: (ticketId: string, perkId: string, field: keyof TicketPerkForm, value: string | number) => void;
  onRemovePerk: (ticketId: string, perkId: string) => void;
}

export interface TicketTypeCardProps {
  ticket: TicketTypeForm;
  index: number;
  errors: FormErrors;
  handlers: TicketTypeCardHandlers;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

/**
 * Ticket type configuration card with cyberpunk styling
 *
 * Features:
 * - Dark/light theme support
 * - Collapsible UI for better space management
 * - Validation error display with warning icons
 * - Brand-consistent styling
 */
export function TicketTypeCard({
  ticket,
  index,
  errors,
  handlers,
}: TicketTypeCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Helper to get error for a field
  const getError = (field: string): string | undefined => {
    return errors[`ticketTypes.${ticket.id}.${field}`];
  };

  // Helper to get perk error
  const getPerkError = (perkId: string, field: string): string | undefined => {
    return errors[`ticketTypes.${ticket.id}.perks.${perkId}.${field}`];
  };

  return (
    <div className="rounded-xl border border-grit-500/30 bg-ink-800/50 backdrop-blur-sm dark:border-grit-500/30 dark:bg-ink-800/50 light:border-grit-400/30 light:bg-bone-100/5">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between border-b border-grit-500/20 bg-ink-900/30 px-6 py-4 transition-colors hover:bg-ink-900/50 dark:border-grit-500/20 dark:bg-ink-900/30 light:border-grit-400/20 light:bg-bone-100/20"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <svg
            className={`h-5 w-5 text-acid-400 transition-transform dark:text-acid-400 light:text-cobalt-500 ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h3 className="brand-heading text-lg uppercase tracking-wide text-bone-100 dark:text-bone-100 light:text-ink-900">
            Tier #{index + 1}
            {ticket.name && ` · ${ticket.name}`}
          </h3>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlers.onRemove(ticket.id);
          }}
          className="text-sm font-mono uppercase tracking-wide text-resistance-400 transition-colors hover:text-resistance-500"
          aria-label="Remove ticket tier"
        >
          Remove
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="space-y-6 p-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Ticket Name */}
            <div>
              <label htmlFor={`ticket-name-${ticket.id}`} className="mb-2 block text-sm font-medium uppercase tracking-wide text-grit-300 dark:text-grit-300 light:text-grit-500">
                Ticket Name <span className="text-resistance-500">*</span>
              </label>
              <input
                id={`ticket-name-${ticket.id}`}
                type="text"
                value={ticket.name}
                onChange={(e) => handlers.onUpdate(ticket.id, 'name', e.target.value)}
                className={`w-full rounded-lg border bg-ink-900/50 px-4 py-3.5 font-mono text-bone-100 placeholder-grit-400 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 dark:bg-ink-900/50 dark:text-bone-100 light:bg-white/50 light:text-ink-900 ${
                  getError('name')
                    ? 'border-resistance-500/50 focus:ring-resistance-500/50'
                    : 'border-grit-500/30 hover:border-acid-400/50 focus:border-acid-400 focus:ring-acid-400/50'
                }`}
                placeholder="e.g., VIP Pass, General Admission"
              />
              {getError('name') && (
                <div className="mt-2 flex items-start gap-2">
                  <span className="text-resistance-500">⚠</span>
                  <p className="text-sm text-resistance-400">{getError('name')}</p>
                </div>
              )}
            </div>

            {/* Currency */}
            <div>
              <label htmlFor={`ticket-currency-${ticket.id}`} className="mb-2 block text-sm font-medium uppercase tracking-wide text-grit-300 dark:text-grit-300 light:text-grit-500">
                Currency <span className="text-resistance-500">*</span>
              </label>
              <select
                id={`ticket-currency-${ticket.id}`}
                value={ticket.currency}
                onChange={(e) => handlers.onUpdate(ticket.id, 'currency', e.target.value)}
                className="w-full rounded-lg border border-grit-500/30 bg-ink-900/50 px-4 py-3.5 font-mono text-bone-100 backdrop-blur-sm transition-all hover:border-acid-400/50 focus:border-acid-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 dark:bg-ink-900/50 dark:text-bone-100 light:bg-white/50 light:text-ink-900"
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor={`ticket-description-${ticket.id}`} className="mb-2 block text-sm font-medium uppercase tracking-wide text-grit-300 dark:text-grit-300 light:text-grit-500">
              Description
            </label>
            <textarea
              id={`ticket-description-${ticket.id}`}
              value={ticket.description}
              onChange={(e) => handlers.onUpdate(ticket.id, 'description', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-grit-500/30 bg-ink-900/50 px-4 py-3.5 font-mono text-bone-100 placeholder-grit-400 backdrop-blur-sm transition-all hover:border-acid-400/50 focus:border-acid-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 dark:bg-ink-900/50 dark:text-bone-100 light:bg-white/50 light:text-ink-900"
              placeholder="What's included with this ticket?"
            />
          </div>

          {/* Price and Capacity */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Price */}
            <div>
              <label htmlFor={`ticket-price-${ticket.id}`} className="mb-2 block text-sm font-medium uppercase tracking-wide text-grit-300 dark:text-grit-300 light:text-grit-500">
                Price <span className="text-resistance-500">*</span>
              </label>
              <input
                id={`ticket-price-${ticket.id}`}
                type="number"
                step="0.01"
                min="0"
                value={ticket.price}
                onChange={(e) => handlers.onUpdate(ticket.id, 'price', e.target.value)}
                className={`w-full rounded-lg border bg-ink-900/50 px-4 py-3.5 font-mono text-bone-100 placeholder-grit-400 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 dark:bg-ink-900/50 dark:text-bone-100 light:bg-white/50 light:text-ink-900 ${
                  getError('price')
                    ? 'border-resistance-500/50 focus:ring-resistance-500/50'
                    : 'border-grit-500/30 hover:border-acid-400/50 focus:border-acid-400 focus:ring-acid-400/50'
                }`}
                placeholder="0.00"
              />
              {getError('price') && (
                <div className="mt-2 flex items-start gap-2">
                  <span className="text-resistance-500">⚠</span>
                  <p className="text-sm text-resistance-400">{getError('price')}</p>
                </div>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label htmlFor={`ticket-capacity-${ticket.id}`} className="mb-2 block text-sm font-medium uppercase tracking-wide text-grit-300 dark:text-grit-300 light:text-grit-500">
                Capacity <span className="text-resistance-500">*</span>
              </label>
              <input
                id={`ticket-capacity-${ticket.id}`}
                type="number"
                min="1"
                value={ticket.capacity}
                onChange={(e) => handlers.onUpdate(ticket.id, 'capacity', e.target.value)}
                className={`w-full rounded-lg border bg-ink-900/50 px-4 py-3.5 font-mono text-bone-100 placeholder-grit-400 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 dark:bg-ink-900/50 dark:text-bone-100 light:bg-white/50 light:text-ink-900 ${
                  getError('capacity')
                    ? 'border-resistance-500/50 focus:ring-resistance-500/50'
                    : 'border-grit-500/30 hover:border-acid-400/50 focus:border-acid-400 focus:ring-acid-400/50'
                }`}
                placeholder="100"
              />
              {getError('capacity') && (
                <div className="mt-2 flex items-start gap-2">
                  <span className="text-resistance-500">⚠</span>
                  <p className="text-sm text-resistance-400">{getError('capacity')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sales Window */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Sales Start */}
            <div>
              <label htmlFor={`ticket-sales-start-${ticket.id}`} className="mb-2 block text-sm font-medium uppercase tracking-wide text-grit-300 dark:text-grit-300 light:text-grit-500">
                Sales Start
              </label>
              <input
                id={`ticket-sales-start-${ticket.id}`}
                type="datetime-local"
                value={ticket.salesStart}
                onChange={(e) => handlers.onUpdate(ticket.id, 'salesStart', e.target.value)}
                className="w-full rounded-lg border border-grit-500/30 bg-ink-900/50 px-4 py-3.5 font-mono text-bone-100 placeholder-grit-400 backdrop-blur-sm transition-all [color-scheme:dark] hover:border-acid-400/50 focus:border-acid-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 dark:bg-ink-900/50 dark:text-bone-100 dark:[color-scheme:dark] light:bg-white/50 light:text-ink-900 light:[color-scheme:light]"
              />
            </div>

            {/* Sales End */}
            <div>
              <label htmlFor={`ticket-sales-end-${ticket.id}`} className="mb-2 block text-sm font-medium uppercase tracking-wide text-grit-300 dark:text-grit-300 light:text-grit-500">
                Sales End
              </label>
              <input
                id={`ticket-sales-end-${ticket.id}`}
                type="datetime-local"
                value={ticket.salesEnd}
                onChange={(e) => handlers.onUpdate(ticket.id, 'salesEnd', e.target.value)}
                className="w-full rounded-lg border border-grit-500/30 bg-ink-900/50 px-4 py-3.5 font-mono text-bone-100 placeholder-grit-400 backdrop-blur-sm transition-all [color-scheme:dark] hover:border-acid-400/50 focus:border-acid-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 dark:bg-ink-900/50 dark:text-bone-100 dark:[color-scheme:dark] light:bg-white/50 light:text-ink-900 light:[color-scheme:light]"
              />
            </div>
          </div>

          {/* Perks Section */}
          <div className="mt-6 border-t border-grit-500/20 pt-6 dark:border-grit-500/20 light:border-grit-400/20">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="brand-heading text-sm uppercase tracking-wider text-grit-300 dark:text-grit-300 light:text-grit-500">Perks & Benefits</h4>
              <button
                type="button"
                onClick={() => handlers.onAddPerk(ticket.id)}
                className="inline-flex items-center gap-2 font-mono text-sm text-acid-400 transition-colors hover:text-acid-500 dark:text-acid-400 light:text-cobalt-500"
                aria-label="Add perk"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="uppercase tracking-wider">Add Perk</span>
              </button>
            </div>

            {ticket.perks.length > 0 && (
              <div className="space-y-3">
                {ticket.perks.map((perk) => (
                  <div key={perk.id} className="rounded-lg border border-grit-500/20 bg-ink-900/30 p-4 dark:border-grit-500/20 dark:bg-ink-900/30 light:border-grit-400/20 light:bg-bone-100/20">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {/* Perk Name */}
                      <div>
                        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-grit-400">
                          Perk Name <span className="text-resistance-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={perk.name}
                          onChange={(e) => handlers.onUpdatePerk(ticket.id, perk.id, 'name', e.target.value)}
                          className={`w-full rounded-lg border bg-ink-900/50 px-3 py-2 font-mono text-sm text-bone-100 placeholder-grit-400 backdrop-blur-sm transition-all focus:outline-none focus:ring-2 dark:bg-ink-900/50 dark:text-bone-100 light:bg-white/50 light:text-ink-900 ${
                            getPerkError(perk.id, 'name')
                              ? 'border-resistance-500/50 focus:ring-resistance-500/50'
                              : 'border-grit-500/30 hover:border-acid-400/50 focus:border-acid-400 focus:ring-acid-400/50'
                          }`}
                          placeholder="e.g., Meet & Greet"
                        />
                        {getPerkError(perk.id, 'name') && (
                          <div className="mt-1 flex items-start gap-1">
                            <span className="text-xs text-resistance-500">⚠</span>
                            <p className="text-xs text-resistance-400">{getPerkError(perk.id, 'name')}</p>
                          </div>
                        )}
                      </div>

                      {/* Perk Quantity */}
                      <div>
                        <label htmlFor={`perk-quantity-${perk.id}`} className="mb-2 block text-xs font-medium uppercase tracking-wide text-grit-400">
                          Quantity <span className="text-resistance-500">*</span>
                        </label>
                        <input
                          id={`perk-quantity-${perk.id}`}
                          type="number"
                          min="1"
                          value={perk.quantity}
                          onChange={(e) => handlers.onUpdatePerk(ticket.id, perk.id, 'quantity', parseInt(e.target.value, 10))}
                          className="w-full rounded-lg border border-grit-500/30 bg-ink-900/50 px-3 py-2 font-mono text-sm text-bone-100 backdrop-blur-sm transition-all hover:border-acid-400/50 focus:border-acid-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 dark:bg-ink-900/50 dark:text-bone-100 light:bg-white/50 light:text-ink-900"
                        />
                      </div>
                    </div>

                    {/* Perk Description */}
                    <div className="mt-3">
                      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-grit-400">
                        Description
                      </label>
                      <textarea
                        value={perk.description}
                        onChange={(e) => handlers.onUpdatePerk(ticket.id, perk.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-grit-500/30 bg-ink-900/50 px-3 py-2 font-mono text-sm text-bone-100 placeholder-grit-400 backdrop-blur-sm transition-all hover:border-acid-400/50 focus:border-acid-400 focus:outline-none focus:ring-2 focus:ring-acid-400/50 dark:bg-ink-900/50 dark:text-bone-100 light:bg-white/50 light:text-ink-900"
                        placeholder="What does this perk include?"
                      />
                    </div>

                    {/* Remove Perk Button */}
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handlers.onRemovePerk(ticket.id, perk.id)}
                        className="font-mono text-xs uppercase tracking-wide text-resistance-400 transition-colors hover:text-resistance-500"
                        aria-label="Remove perk"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
