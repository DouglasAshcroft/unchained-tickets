from pathlib import Path

# Full Artist MVP Sprint Planning Artifact in MD format

artist_mvp_md = """

# 🎤 Artist MVP — Full Sprint Planning Artifact

This document compiles **User Stories**, **Developer Tasks**, **Design Tasks**, **Marketing Pitch**, **KPIs**, and **KPI Measurement Plans** for the Artist MVP mock flow.

---

## **User Story 1 — Artist Onboarding & Profile Setup**

**As a** performing artist
**I want to** create a profile with my bio, images, social links, and wallet info
**So that** venues and fans can discover me and I can receive ticket royalty payments

**Marketing & Sales Pitch:**
“Launch your artist profile in minutes — connect with venues, showcase your brand, and get ready to earn royalties from your shows.”

**KPIs:**

- Profile creation time < 10 minutes.
- 90% profile completion rate.
- ≥ 80% of signups include at least one image and bio.

**KPI Measurement Plan:**

- **Data Capture:** Start & end timestamps for profile creation, completion percentage.
- **Implementation:** Track events in mock DB; add `profile_completed` flag.
- **Review:** Weekly review during MVP testing.

**Developer Tasks:**

1. Create `/artist-login` and `/artist-dashboard` routes.
2. Build mock signup/profile form with name, genre, bio, social links, wallet.
3. Store profile in localStorage/mock DB.
4. Redirect to `/artist-events`.

**Design Tasks:**

- Image upload & preview.
- Mobile-friendly, minimal form.
- Profile preview before save.

---

## **User Story 2 — Event Association & Ticket Approval**

**As a** performing artist
**I want to** review and approve my event listings and ticket tiers
**So that** I can ensure accuracy before fans start buying tickets

**Marketing & Sales Pitch:**
“Review and approve your show details instantly — make sure every ticket is priced and presented the way you want.”

**KPIs:**

- 100% of events approved or edited before ticket sales open.
- Approval turnaround < 48 hours.

**KPI Measurement Plan:**

- **Data Capture:** Approval timestamps, request edit logs.
- **Implementation:** Store approval status & time in mock DB.
- **Review:** Track per-event compliance.

**Developer Tasks:**

1. Create `/artist-events` page.
2. Add Approve/Request Edit actions.
3. Save approval status.
4. Edit request modal.

**Design Tasks:**

- Event card with status badge.
- Edit request modal.
- Consistent with venue dashboard.

---

## **User Story 3 — Merch & Rewards Management (Optional MVP)**

**As a** performing artist
**I want to** upload and configure merch or NFT fan rewards linked to event tickets
**So that** fans can purchase exclusive items or receive rewards for attending

**Marketing & Sales Pitch:**
“Boost your earnings with exclusive merch and NFT fan rewards — create them right from your dashboard.”

**KPIs:**

- ≥ 20% of events include at least one merch/reward item.
- Merch view rate ≥ 50% by ticket buyers.

**KPI Measurement Plan:**

- **Data Capture:** Merch item creation logs, fan view counts (mock).
- **Implementation:** Track merch linked to event IDs; simulate views.
- **Review:** Monthly merch adoption report.

**Developer Tasks:**

1. Create `/artist-merch` page.
2. Add merch/reward creation form.
3. Save to mock DB.
4. Display on fan event page.

**Design Tasks:**

- Card layout for merch.
- Upload UI consistent with profile form.
- “Exclusive Reward” badge styling.

---

## **User Story 4 — Fan Engagement & Promotion**

**As a** performing artist
**I want to** share my event links and send fan updates
**So that** I can promote my shows and increase ticket sales

**Marketing & Sales Pitch:**
“Promote your shows with one click — share your event links and track fan engagement instantly.”

**KPIs:**

- ≥ 25% of artists share at least one event link.
- Click-through rate ≥ 10%.

**KPI Measurement Plan:**

- **Data Capture:** Share button clicks, link click counts (mock).
- **Implementation:** Generate mock short link with counter.
- **Review:** Monthly CTR tracking.

**Developer Tasks:**

1. Share button on event detail.
2. Generate mock short link.
3. Track clicks in localStorage.

**Design Tasks:**

- Share button with social icons.
- Modal with link copy & QR code.
- Click count display.

---

## **User Story 5 — Event Day Live Insights**

**As a** performing artist
**I want to** see real-time attendance and merch sales
**So that** I can adjust my set, engagement, or merch promotion accordingly

**Marketing & Sales Pitch:**
“Know your crowd in real time — track attendance and merch sales while you’re on stage.”

**KPIs:**

- ≥ 90% of active artists view live data on event day.
- Live dashboard refresh rate < 30 seconds.

**KPI Measurement Plan:**

- **Data Capture:** Live dashboard open events, refresh timestamps.
- **Implementation:** Auto-refresh with mock data feed.
- **Review:** Per-event adoption tracking.

**Developer Tasks:**

1. Create `/artist-live` tab.
2. Pull attendance from mock venue check-in.
3. Pull merch sales from mock DB.
4. Auto-refresh every 30 seconds.

**Design Tasks:**

- High-contrast dashboard cards.
- Attendance chart.
- Big readable numbers.

---

## **User Story 6 — Post-Event Analytics & Royalties**

**As a** performing artist
**I want to** view sales, royalties, and merch performance after my event
**So that** I can track my earnings and understand my audience engagement

**Marketing & Sales Pitch:**
“Get your numbers right away — ticket sales, merch, and royalties all in one report.”

**KPIs:**

- Report accuracy = 100% vs. mock DB.
- Report generation < 5 seconds.

**KPI Measurement Plan:**

- **Data Capture:** Report gen time, accuracy check vs DB.
- **Implementation:** Compare generated report with stored order data.
- **Review:** Weekly review during testing.

**Developer Tasks:**

1. Create `/artist-reports` route.
2. Pull ticket, royalty, merch data.
3. Table & chart view.
4. CSV export.

**Design Tasks:**

- Artist-branded report layout.
- Event header with image/date.
- Export button styling.

---

## **User Story 7 — Fanbase Growth & Retargeting**

**As a** performing artist
**I want to** access a list of my NFT ticket holders who opted in to communications
**So that** I can invite them to future shows and build loyalty

**Marketing & Sales Pitch:**
“Turn one-time fans into superfans — keep in touch with your NFT ticket holders.”

**KPIs:**

- ≥ 70% of artists export at least one fan list post-event.
- Repeat ticket purchase rate ≥ 15% within 6 months.

**KPI Measurement Plan:**

- **Data Capture:** Fan list exports, repeat ticket purchases (mock).
- **Implementation:** Match attendee emails/hashes across events.
- **Review:** Quarterly repeat buyer analysis.

**Developer Tasks:**

1. Create `/artist-fanbase` route.
2. Pull attendees linked to artist ID.
3. Filters for event/ticket type.
4. CSV export for opt-in fans.

**Design Tasks:**

- Table view with opt-in badge.
- Filter dropdowns.
- Consistent export button styling.

---

"""
