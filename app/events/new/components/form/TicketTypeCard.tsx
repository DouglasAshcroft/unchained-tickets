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
 * Ticket type configuration card with collapsible UI
 *
 * Features:
 * - Ticket tier details (name, description, price, capacity)
 * - Sales window configuration
 * - Perks management (add, edit, remove)
 * - Collapsible for better UX with multiple tiers
 * - Validation error display
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
    <div className="rounded-lg border border-gray-300 bg-white shadow-sm">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <svg
            className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">
            Ticket Tier #{index + 1}
            {ticket.name && ` - ${ticket.name}`}
          </h3>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlers.onRemove(ticket.id);
          }}
          className="text-sm text-red-600 hover:text-red-800"
          aria-label="Remove ticket tier"
        >
          Remove Ticket
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="space-y-4 p-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Ticket Name */}
            <div>
              <label htmlFor={`ticket-name-${ticket.id}`} className="mb-1 block text-sm font-medium text-gray-700">
                Ticket Name *
              </label>
              <input
                id={`ticket-name-${ticket.id}`}
                type="text"
                value={ticket.name}
                onChange={(e) => handlers.onUpdate(ticket.id, 'name', e.target.value)}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  getError('name')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="e.g., VIP Pass, General Admission"
              />
              {getError('name') && (
                <p className="mt-1 text-sm text-red-600">{getError('name')}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label htmlFor={`ticket-currency-${ticket.id}`} className="mb-1 block text-sm font-medium text-gray-700">
                Currency *
              </label>
              <select
                id={`ticket-currency-${ticket.id}`}
                value={ticket.currency}
                onChange={(e) => handlers.onUpdate(ticket.id, 'currency', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label htmlFor={`ticket-description-${ticket.id}`} className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id={`ticket-description-${ticket.id}`}
              value={ticket.description}
              onChange={(e) => handlers.onUpdate(ticket.id, 'description', e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's included with this ticket?"
            />
          </div>

          {/* Price and Capacity */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Price */}
            <div>
              <label htmlFor={`ticket-price-${ticket.id}`} className="mb-1 block text-sm font-medium text-gray-700">
                Price *
              </label>
              <input
                id={`ticket-price-${ticket.id}`}
                type="number"
                step="0.01"
                min="0"
                value={ticket.price}
                onChange={(e) => handlers.onUpdate(ticket.id, 'price', e.target.value)}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  getError('price')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="0.00"
              />
              {getError('price') && (
                <p className="mt-1 text-sm text-red-600">{getError('price')}</p>
              )}
            </div>

            {/* Capacity */}
            <div>
              <label htmlFor={`ticket-capacity-${ticket.id}`} className="mb-1 block text-sm font-medium text-gray-700">
                Capacity *
              </label>
              <input
                id={`ticket-capacity-${ticket.id}`}
                type="number"
                min="1"
                value={ticket.capacity}
                onChange={(e) => handlers.onUpdate(ticket.id, 'capacity', e.target.value)}
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  getError('capacity')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="100"
              />
              {getError('capacity') && (
                <p className="mt-1 text-sm text-red-600">{getError('capacity')}</p>
              )}
            </div>
          </div>

          {/* Sales Window */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Sales Start */}
            <div>
              <label htmlFor={`ticket-sales-start-${ticket.id}`} className="mb-1 block text-sm font-medium text-gray-700">
                Sales Start
              </label>
              <input
                id={`ticket-sales-start-${ticket.id}`}
                type="datetime-local"
                value={ticket.salesStart}
                onChange={(e) => handlers.onUpdate(ticket.id, 'salesStart', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sales End */}
            <div>
              <label htmlFor={`ticket-sales-end-${ticket.id}`} className="mb-1 block text-sm font-medium text-gray-700">
                Sales End
              </label>
              <input
                id={`ticket-sales-end-${ticket.id}`}
                type="datetime-local"
                value={ticket.salesEnd}
                onChange={(e) => handlers.onUpdate(ticket.id, 'salesEnd', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Perks Section */}
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">Perks & Benefits</h4>
              <button
                type="button"
                onClick={() => handlers.onAddPerk(ticket.id)}
                className="text-sm text-blue-600 hover:text-blue-800"
                aria-label="Add perk"
              >
                + Add Perk
              </button>
            </div>

            {ticket.perks.length > 0 && (
              <div className="space-y-3">
                {ticket.perks.map((perk) => (
                  <div key={perk.id} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {/* Perk Name */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          Perk Name *
                        </label>
                        <input
                          type="text"
                          value={perk.name}
                          onChange={(e) => handlers.onUpdatePerk(ticket.id, perk.id, 'name', e.target.value)}
                          className={`w-full rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 ${
                            getPerkError(perk.id, 'name')
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                          placeholder="e.g., Meet & Greet"
                        />
                        {getPerkError(perk.id, 'name') && (
                          <p className="mt-1 text-xs text-red-600">{getPerkError(perk.id, 'name')}</p>
                        )}
                      </div>

                      {/* Perk Quantity */}
                      <div>
                        <label htmlFor={`perk-quantity-${perk.id}`} className="mb-1 block text-xs font-medium text-gray-600">
                          Quantity *
                        </label>
                        <input
                          id={`perk-quantity-${perk.id}`}
                          type="number"
                          min="1"
                          value={perk.quantity}
                          onChange={(e) => handlers.onUpdatePerk(ticket.id, perk.id, 'quantity', parseInt(e.target.value, 10))}
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Perk Description */}
                    <div className="mt-3">
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Description
                      </label>
                      <textarea
                        value={perk.description}
                        onChange={(e) => handlers.onUpdatePerk(ticket.id, perk.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="What does this perk include?"
                      />
                    </div>

                    {/* Remove Perk Button */}
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handlers.onRemovePerk(ticket.id, perk.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                        aria-label="Remove perk"
                      >
                        Remove Perk
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
