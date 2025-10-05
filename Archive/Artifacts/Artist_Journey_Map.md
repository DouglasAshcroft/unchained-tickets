from pathlib import Path

venue_mvp_artifact = """

# 🏟 Venue MVP — Full Sprint Planning Artifact

This document compiles **User Stories**, **Dev Tasks**, **Design Tasks**, **Marketing Pitch**, **KPIs**, and **KPI Measurement Plans** for the Venue MVP mock flow.

---

## **User Story 1 — Venue Onboarding**

**As a** venue manager
**I want to** create an account and set up my profile
**So that** I can start listing events and selling NFT tickets

**Marketing & Sales Pitch:**
“Sign up in minutes — no complex blockchain setup. Start selling next-gen tickets today with zero setup cost. Control your brand, your sales, and your fan data.”

**KPIs:**

- Venue sign-up → first event created in < 24 hours.
- 80% completion rate for onboarding form.
- At least 3 venues onboarded in first hackathon demo month.

**KPI Measurement Plan:**

- **Data Capture:**
  - Timestamp when venue account created.
  - Timestamp when first event published.
  - Form completion attempts vs. completions.
- **Implementation:**
  - Save timestamps in mock DB/localStorage.
  - Add a `signup_completed` flag to venue record.
  - Create a dashboard “Venue Metrics” page for PM review.
- **Review:** Weekly check during MVP testing phase.

**Developer Tasks:**

1. Create `/venue-login` and `/venue-dashboard` routes.
2. Build mock account creation form (fields: name, contact email, payout method).
3. Save venue profile to `localStorage` or mock DB.
4. Redirect user to `/create-event` after signup.

**Design Tasks:**

- Business-oriented login/onboarding UI.
- Two-step form layout with progress indicator.
- Trust markers (“Secure, no blockchain setup needed for trial”).

---

## **User Story 2 — Event Creation**

**As a** venue manager
**I want to** create and publish an event
**So that** fans can see and purchase tickets

**Marketing & Sales Pitch:**
“Create events in under 5 minutes with built-in NFT ticketing and resale royalties. No middlemen — you set the rules and keep more revenue.”

**KPIs:**

- 100% of events published without errors.
- Event creation time < 15 minutes for first-time venue.
- 50% of published events have at least 1 tier with royalties enabled.

**KPI Measurement Plan:**

- **Data Capture:**
  - Track form start → publish timestamp.
  - Log number of tier configurations with royalty > 0.
  - Log publish success/failure events.
- **Implementation:**
  - Add `created_at` and `published_at` fields in event object.
  - Event form save triggers log to `metrics.json`.
- **Review:** Compare average creation time & royalty usage monthly.

**Developer Tasks:**

1. Create `/create-event` page with event form.
2. Implement mock image upload.
3. Add dynamic ticket tier form.
4. Save event to `events.json` or localStorage.
5. Implement “Preview” and “Publish” flow.

**Design Tasks:**

- Two-column layout with live preview.
- Tier card visuals (GA, VIP).
- Theme-consistent date/time pickers.

---

## **User Story 3 — Sales Monitoring**

**As a** venue manager
**I want to** see how ticket sales are performing in real-time
**So that** I can make pricing or promotion decisions

**Marketing & Sales Pitch:**
“Track your sales in real time — no more waiting for end-of-day reports. See what’s working and boost slow-selling tiers instantly.”

**KPIs:**

- Dashboard load time < 5s.
- 90% of venues check dashboard at least once per event.
- Correlation between dashboard use & improved sell-through on low tiers.

**KPI Measurement Plan:**

- **Data Capture:**
  - Log page load timestamp & duration.
  - Log event ID each time dashboard is opened.
  - Track ticket sales before vs. after dashboard views (mock analysis).
- **Implementation:**
  - Use a timer in dashboard load function to calculate render speed.
  - Store access counts in localStorage metrics.
- **Review:** Post-event review for each venue.

**Developer Tasks:**

1. Create `/sales-dashboard` route.
2. Aggregate sales by tier & calculate revenue.
3. Render chart for daily sales.
4. Add table with sorting.

**Design Tasks:**

- High-contrast charts labeled “Simulated Data”.
- Inventory badges (green/yellow/red).
- Mobile-friendly dashboard cards.

---

## **User Story 4 — Event Day Check-In**

**As a** venue door staff
**I want to** scan attendee tickets
**So that** I can validate entry and track attendance

**Marketing & Sales Pitch:**
“Fast, fraud-proof entry with real-time headcount — even works in low-light, noisy venues.”

**KPIs:**

- Average scan time < 3 seconds.
- 0% counterfeit tickets admitted (mocked).
- 95%+ successful check-in rate.

**KPI Measurement Plan:**

- **Data Capture:**
  - Log scan start/end timestamps to calculate speed.
  - Log each scan result as valid/invalid.
  - Log percentage of total sold tickets checked in.
- **Implementation:**
  - Wrap scan function in a timer.
  - Save results in `checkin_metrics.json`.
- **Review:** Immediate post-event summary.

**Developer Tasks:**

1. Create `/check-in` route.
2. Implement mock QR/manual ID scan.
3. Mark ticket as checked-in & save timestamp.
4. Display live headcount.

**Design Tasks:**

- Mobile-first high-contrast UI.
- Large scan button & clear success/error states.
- Minimalist design for event conditions.

---

## **User Story 5 — Settlement & Reports**

**As a** venue manager
**I want to** download a post-event settlement report
**So that** I can reconcile income and royalties

**Marketing & Sales Pitch:**
“Instant settlement reports that match your books — no more waiting days to know your payout.”

**KPIs:**

- Report accuracy = 100% vs mock order data.
- Report generation time < 5s.
- 80% of venues export at least one report per event.

**KPI Measurement Plan:**

- **Data Capture:**
  - Compare totals in report vs. raw order data (mock validation).
  - Log report generation start/end time.
  - Log every export action with event ID.
- **Implementation:**
  - Generate reports from stored order data & verify totals match.
  - Record export events in metrics file.
- **Review:** Monthly PM review of export usage & speed.

**Developer Tasks:**

1. Create `/reports` route.
2. Calculate gross, fees, net payout, royalties.
3. Render report in table format.
4. Export CSV for report & attendee list.

**Design Tasks:**

- Print-friendly report layout.
- Event header with name/logo/date.
- Download button with icon.

---

## **User Story 6 — Retargeting Campaign**

**As a** venue marketing lead
**I want to** download a list of attendees
**So that** I can promote future events to them

**Marketing & Sales Pitch:**
“Your fans, your data — re-engage past attendees directly and grow loyalty without paying ad platforms.”

**KPIs:**

- 70% of venues export attendee lists post-event.
- Repeat ticket buyer rate ≥ 20% within 3 months.
- Average open rate on venue email campaigns ≥ 25%.

**KPI Measurement Plan:**

- **Data Capture:**
  - Log attendee export actions with event ID & timestamp.
  - Tag attendees in DB to track future purchases.
  - Record engagement metrics manually for MVP (from venue feedback).
- **Implementation:**
  - Add export tracking in audience tab.
  - For repeat buyer rate, match attendee email/hash across events.
- **Review:** Quarterly review of repeat buyer rate.

**Developer Tasks:**

1. Create `/audience` route.
2. Fetch attendees & filter by event/tier.
3. Add opt-in filter.
4. Export filtered list as CSV.

**Design Tasks:**

- Simple filter UI (dropdowns/checkboxes).
- Table view with opt-in badge.
- Export button styled consistently with Reports tab.

---

"""

path = Path("/mnt/data/Venue_MVP_Sprint_Planning_Artifact.md")
path.write_text(venue_mvp_artifact)
path.name
