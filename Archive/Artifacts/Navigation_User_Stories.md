# 🧭 Navigation & User Flow Sprint — User Stories

## ✅ User Story 1: Navigate Between Pages (Top Navigation)

**As a** user
**I want to** see a top navigation menu
**So that** I can move between the homepage, event listings, and my profile

### Acceptance Criteria

**Scenario:** User views the app on desktop or mobile
**Given** the user has loaded the app
**When** they look at the top of the screen
**Then** they should see nav links/buttons for:

- Home
- Events
- My Profile

**And** clicking any link routes them to the corresponding view
**And** the nav persists across pages

---

## ✅ User Story 2: Search for Events

**As a** fan
**I want to** search for upcoming events by keyword or location
**So that** I can find shows that interest me quickly

### Acceptance Criteria

**Scenario:** User enters a search query
**Given** the user is on the Events page
**When** they type a keyword into the search bar (e.g. "punk", "DC")
**And** click "Search" or press Enter
**Then** the event list updates to show relevant results
**And** a message appears if no results are found

---

## ✅ User Story 3: View Event Detail Page

**As a** user
**I want to** click on an event to see more information
**So that** I can decide whether to attend or claim a ticket

### Acceptance Criteria

**Scenario:** User clicks on an event card
**Given** the events are visible on the Events page
**When** the user clicks a card or title
**Then** the app navigates to a new route with the event’s details
**And** the page includes event title, venue, date, directions, and call-to-action

---

## ✅ User Story 4: Access User Profile Page

**As a** returning user
**I want to** log in and access my profile
**So that** I can view my NFT tickets and saved events

### Acceptance Criteria

**Scenario:** User clicks "My Profile"
**Given** the user is on any page
**When** they click the profile link
**Then** they are routed to a Profile page
**And** see a welcome message, placeholder ticket list, and future login options

> 🔒 _Note: No real login yet — simulate with guest state for now_

## ✅ User Story 6: Sticky Navigation

**As a** user
**I want to** keep the nav bar visible as I scroll
**So that** I can always navigate without needing to scroll to the top

### Acceptance Criteria

**Scenario:** User scrolls down any page
**Given** the user is scrolling content
**When** they scroll more than one screen height
**Then** the nav remains fixed at the top
**And** retains full functionality and styling

---

Stretch

## ✅ User Story 5: Mobile Navigation Menu

**As a** mobile user
**I want to** access navigation via a collapsible menu
**So that** the site remains clean and usable on small screens

### Acceptance Criteria

**Scenario:** User views the site on a mobile device
**Given** the screen is <768px wide
**When** they tap the hamburger menu
**Then** a vertical nav panel slides in
**And** they can tap links to navigate pages
**And** the menu collapses afterward

---
