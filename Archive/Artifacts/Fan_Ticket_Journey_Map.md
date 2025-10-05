# 🎟️ Fan Ticket Buying Journey — Mocked Process Map (Milestone: NFT Ticketing Simulation)

> Purpose: Simulate end-to-end fan experience to validate flows, messaging, and data capture **before** real minting and venue integrations.

---

## 🗺️ Journey Stages (Overview)

1. **Awareness** → 2. **Browse/Discover Events** → 3. **Event Detail** → 4. **Wallet (Mock) & Identity** → 5. **Ticket Selection (Mock)** → 6. **Checkout (Mock)** → 7. **Confirmation** → 8. **Pre‑Event (“My Tickets”)** → 9. **Event Day Check‑In (Simulated)** → 10. **Post‑Event Stub/Rewards (Simulated)**

---

## 1) Awareness

**Fan Goal:** Understand Unchained and why it’s different.  
**Touchpoints:** Hero/mission section, value props, social proof (coming soon).

**Frontstage (UX):** Mission headline, anti‑scalping pitch, “How it works” explainer.  
**Backstage (Mock):** No integration. Track CTA views and clicks.

**Data to Capture:** Pageview, CTA clicks, optional email.  
**Success Metrics:** CTR to Events page ≥ 25%.  
**Risks/Edge Cases:** Bounce before value prop; unclear messaging.

---

## 2) Browse / Discover Events

**Fan Goal:** Find a show worth buying.  
**Touchpoints:** Events list, search, filters (location/genre/date).

**Frontstage (UX):** Real events feed, search bar, empty/error states.  
**Backstage (Mock):** Ticketing API fetch; client-side filter; loading states.

**Data to Capture:** Query text, selected filters, clicked event IDs.  
**Success Metrics:** Search-to-click rate ≥ 40%.  
**Risks/Edge Cases:** API outage → show cached/mock list + message.

**Key User Story (Search):**  
_As a fan, I want to search events so I can quickly find relevant shows._  
**Scenario:** Enter query → Update results → Handle no results.

---

## 3) Event Detail

**Fan Goal:** Decide to “buy” (simulate).  
**Touchpoints:** Event page with details, gallery, venue map, “Get Ticket” CTA.

**Frontstage (UX):** Title, date/time, venue, description, seat/tier examples, FAQs.  
**Backstage (Mock):** Load event by ID; no live inventory.

**Data to Capture:** Event view, CTA clicks.  
**Success Metrics:** Detail-to-CTA click-through ≥ 35%.  
**Risks/Edge Cases:** Missing images/metadata → show fallbacks.

**Key User Story:**  
_As a fan, I want to view event details so I can decide to purchase._

---

## 4) Wallet (Mock) & Identity

**Fan Goal:** Understand wallet requirement without blocking.  
**Touchpoints:** “Connect Wallet (Preview)” + “Continue as Guest”

**Frontstage (UX):** Two options: connect (mock) or guest (email).  
**Backstage (Mock):** Simulate wallet address; store guest ID/email only.

**Data to Capture:** Chosen path, mock wallet address or guest token.  
**Success Metrics:** ≥ 80% proceed past this step when guest path is available.  
**Risks/Edge Cases:** Wallet friction; reassure with “no crypto required to try.”

**Key User Story:**  
_As a fan, I want to continue as a guest so I can try the flow without a wallet._

---

## 5) Ticket Selection (Mock)

**Fan Goal:** Choose tier/quantity confidently.  
**Touchpoints:** Tier cards (GA/VIP), quantity picker, fees transparency.

**Frontstage (UX):** Select tier + qty; fee disclosure; subtotal.  
**Backstage (Mock):** No inventory lock; simple validation (max 6).

**Data to Capture:** Selected tier, qty.  
**Success Metrics:** Selection-to-checkout ≥ 70%.  
**Risks/Edge Cases:** Over‑selection → friendly error; edge: zero qty.

**Key User Story:**  
_As a fan, I want to select ticket type/quantity so I can proceed to checkout._

---

## 6) Checkout (Mock)

**Fan Goal:** Complete purchase easily; see security/benefits.  
**Touchpoints:** Summary, email (required), terms, “Complete Purchase (Mock)”

**Frontstage (UX):** Order summary; trust copy; single CTA.  
**Backstage (Mock):** No payment; write mock order to localStorage.

**Data to Capture:** Email (required), order summary.  
**Success Metrics:** Checkout completion ≥ 60% of ticket selections.  
**Risks/Edge Cases:** Invalid email; duplicate submission → idempotent write.

**Key User Story:**  
_As a fan, I want a simple checkout so I can confirm my order without payment now._

---

## 7) Confirmation

**Fan Goal:** Know that the order is secured and where to find it.  
**Touchpoints:** Confirmation screen; link to “My Tickets”

**Frontstage (UX):** Order ID, event details, QR placeholder, “View My Tickets.”  
**Backstage (Mock):** Generate mock order ID; store order; emit “order_created”.

**Data to Capture:** Order ID, timestamp.  
**Success Metrics:** Click-through to “My Tickets” ≥ 80%.

**Key User Story:**  
_As a fan, I want clear confirmation so I know where my ticket lives._

---

## 8) Pre‑Event — “My Tickets”

**Fan Goal:** See ticket; trust it will scan at venue.  
**Touchpoints:** My Tickets list; ticket detail with QR placeholder; transfer button (disabled).

**Frontstage (UX):** Card with event, date, tier; QR placeholder; status = “Active on event day.”  
**Backstage (Mock):** Read orders from localStorage; status computed by date.

**Data to Capture:** Views, attempted transfers.  
**Success Metrics:** Return visits to “My Tickets” ≥ 50%.

**Key User Story:**  
_As a fan, I want to see my ticket in My Tickets so I can prepare for the event._

---

## 9) Event Day Check‑In (Simulated)

**Fan Goal:** Get in fast.  
**Touchpoints:** “Show Code” CTA → Big QR/Code; status badge: “Checked‑In”.

**Frontstage (UX):** One‑tap large QR code view; success state after scan.  
**Backstage (Mock):** Simulate scan → mark order as checked‑in; timestamp.

**Data to Capture:** Check‑in timestamp.  
**Success Metrics:** Simulated scan success ≥ 95%.

**Key User Story:**  
_As a fan, I want a scannable ticket so I can get into the venue quickly._

---

## 10) Post‑Event Stub/Rewards (Simulated)

**Fan Goal:** Keep a collectible + receive perks.  
**Touchpoints:** Automatic issuance message; “View Stub” in My Tickets; Rewards badge.

**Frontstage (UX):** Ticket converts to “Stub NFT (Preview)”; rewards badge (XP/perk).  
**Backstage (Mock):** Auto‑issue stub when event end time passes; write stub object.

**Data to Capture:** Stub claimed flag, rewards earned.  
**Success Metrics:** Stub view rate ≥ 70%; rewards click-through ≥ 30%.

**Key User Story:**  
_As a fan, I want a collectible stub so I feel rewarded for attending._

---

## 🎯 Success Metrics (End-to-End)

- Landing → Events CTR ≥ 25%
- Events → Event Detail CTR ≥ 40%
- Detail → Selection ≥ 35%
- Selection → Checkout ≥ 70%
- Checkout → Confirmation ≥ 60%
- Confirmation → My Tickets click ≥ 80%
- Post‑Event: Stub view ≥ 70%

---

## 🧩 Dependencies & Mocking Rules

- **No payments, no blockchain** for this milestone.
- All orders, tickets, stubs stored in **localStorage** (namespaced).
- Mock wallet address for “Connect” or proceed as Guest with email.
- Time-based automations (check‑in eligibility, stub issuance) simulated by local clock.

---

## 🧪 Test Scenarios & Edge Cases

- Empty events list → graceful message + retry.
- Invalid email → inline validation.
- Multi‑tab duplicates → idempotent write by order ID.
- Offline mode → My Tickets still readable; writes queued (optional stretch).
- Time zone mismatches → event timezone shown explicitly.

---

## 🗂️ Backlog (Stretch)

- Transfer/sell (disabled UI with tooltip)
- Seat map (static)
- Venue loyalty tier (badge only)
- Deep links for tickets and events
- Add-to-calendar

---
