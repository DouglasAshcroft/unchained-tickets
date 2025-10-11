Here’s a high-level implementation roadmap for the Venue Onboarding epic. It’s organized around the user stories and breaks the work into coordinated streams so venues get to “value” quickly while we continue layering in depth.

**Progress update (2025-10-15):** Ticket tier management and seat-map ingestion now exist end-to-end (Prisma models, API endpoints, admin UI). Reserved tiers trigger seat-map requirements and populate event-level reserved seat inventory for future checkout flows.

Phase 0 – Foundations (already in place or underway)
Secure/stable infra: Coinbase charges + webhook minting, chain supply fix, charge retry metadata, deployment runbooks.
Prereq data: Ensure Prisma schema and migrations cover charges, promotions, venue/event relationships.
Phase 1 – Fast Event Creation (Story 1)
Event creation wizard
UX: 3–4 step flow (Basics → Schedule/Location → Tickets snapshot → Publish).
Backend: extend event service to accept draft events; support status=draft/published.
Files touched: app/events/new page, shared form components, app/api/events/route.ts.
Image upload + storage
Decide on storage (Vercel Blob/S3); integrate signed upload flow.
Editable events
REST/GraphQL mutation to update events post-publish.
Ensure contract tier supply updates if on-chain data must change (captured in Phase 2).
Deliverable: venues can create/publish an event in minutes; can return to edit details.

Phase 2 – Flexible Ticket Types & Seating (Story 2)
Ticket tier management *(core pricing + capacity delivered 2025-10-15; presale/promo pending)*
UI table for tiers (name, price, quantity, sales window, presale code).
Backend: extend Prisma Ticket/Charge handling; map to contract tier IDs. *(Prisma + EventService updates shipped)*
Seat-map designer (deferred or scoped)
MVP: upload JSON/CSV seating map; choose sections/tier mapping. *(JSON upload + seat inventory assignment complete; managed from venue dashboard onboarding instead of the event wizard)*
Future: visual designer using canvas library (phase 2.5).
Presale rules & limits
Support per-tier promo codes, per-buyer limit, waitlist toggles.
Deliverable: event wizard includes a “Ticket Types” step; venues manage GA/VIP/presales.

Phase 3 – Promo Codes & Checkout Questions (Story 3)
Promo/access code engine
DB model for codes (name, discount, usage limit, expiry).
Middleware to validate code at checkout.
Custom checkout questions
UI builder on event settings.
Store answers linked to Ticket or Charge.
Export via analytics API/CSV.
Deliverable: marketing + attendee data capture.

Phase 4 – Branded Event Pages & Marketing (Story 4)
Branding controls
Event settings for theme colors, logos, custom slug.
Support embedded widget or iframes for venue sites.
Collectible poster workflow
AI-assisted poster generation with venue-provided prompts plus manual upload fallback.
Per-tier poster variants (VIP, GA, section-based) with approval queue and staff-facing identifiers.
Second-phase reveal: redeeming a ticket upgrades the collectible to the approved poster art, with audit trail.
Email templates
Template builder (confirmation, reminder, post-event).
Integrate with selected email provider (Resend/Postmark).
Referral/Affiliate links
Generate tracked URLs; track conversions (new table).
Optional: tie to loyalty module (story 9).
Discovery portal integration
Ensure events publish to /events listing; add search facets for location/category.
Deliverable: event page matches venue brand, supports marketing outreach.

Phase 5 – Checkout & Delivery Enhancements (Story 5 & 6)
Checkout improvements
Full cost transparency (fee breakdown).
Device/language support; base translations for UI strings.
Payment options
Integrate additional providers (Stripe for cards, PayPal/Venmo). For each, check NFT mint path.
Highlight Base Paymaster USDC checkout as discounted/fee-preferred because gasless; educate buyers at selection step.
Guest checkout + social login
Allow email-only checkout; optional Google/Facebook login.
Ticket delivery
Generate PKPass/Google Wallet; email & SMS notifications.
Print-at-home & box office modes.
Accessibility/complex orders
Discounts, companion seats, add-ons in single flow.
Deliverable: frictionless purchase experience that matches traditional ticketing options.

Phase 6 – Organizer Dashboards & Analytics (Story 7 & 8)
Venue dashboard
Onboarding checklist, quick links, recent events, payout status.
Sales & check-in dashboards
Real-time ticket counts, revenue graphs, scan-in metrics.
Reports & exports
Transaction CSV, settlement summaries, attendee lists.
Integration hooks (Google Analytics, Facebook Pixel, APIs/webhooks).
Deliverable: organizers have visibility and exports comparable to existing platforms.

Phase 7 – Fan Engagement & NFT Benefits (Story 9)
Optional NFT minting toggle per event
Auto set contract metadata URI; allow post-scan souvenir transformation.
Loyalty + rewards
Track repeat attendance; issue badges/discounts.
Token-gated presales/VIP
Use wallet check or tokenproof integration.
Merch/add-on upsells
Add to checkout flow with bundling.
Deliverable: differentiating blockchain features without forcing crypto UX.
Rarity tracking & dynamic metadata
Capture supply changes across lifecycle (minted, sold, redeemed, remaining) and surface rarity increments in ticket metadata, dashboards, and collectible reveals.

Phase 8 – Security, Compliance & Support (Story 10 & 11)
Compliance
PCI (via Stripe/processor), GDPR/CCPA docs, data usage consent.
Anti-bot/queue
Captcha, waitlist, verified fan pre-reg.
Ops readiness
On-call, 24/7 support plan, optional onsite support.
Finance & settlement
Payout scheduling, ACH integration, final settlement reports.
Refund workflow with audit trail.
Deliverable: enterprise readiness for venues switching from incumbent platforms.

Cross-cutting tasks
Security & monitoring (already planned): ensure rate limiting, CSP, Sentry.
Docs & onboarding: update VenueOnboarding.md with progress, create tutorials.
Smart contract alignment: confirm each feature that touches on-chain has corresponding contract support or plan for contract upgrade.
Poster asset governance: align storage, moderation, and provenance for generated/uploaded art; ensure licensing confirmations are stored.
Rarity data plumbing: ensure contract + off-chain services expose lifecycle counts for analytics and staff tooling.
Next steps: If this roadmap looks good, we can pick the first development slice (Phase 1 event wizard + basic tier management) and start breaking it into specific tasks (UI components, API endpoints, Prisma changes, tests).
