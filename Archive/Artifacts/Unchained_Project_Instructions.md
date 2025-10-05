# Unchained Project Instructions

## Project Overview

Unchained is a decentralized NFT ticketing system designed to disrupt
monopolistic ticketing practices. It delivers value back to
Artists/Performers, Venues, and Fans. The design aesthetic follows a
punk underground resistance movement, with marketing centered around
"Join the Resistance" messaging.

## Tech Stack

- React (Vite)
- Node.js / Express
- Tailwind CSS
- PostgreSQL / Knex
- Docker Compose (planned for services)
- Other modules as needed (e.g., bcrypt, cookies, testing frameworks)

## Active Files in App

- `ApiFetch.jsx`
- `ArtistsSection.jsx`
- `EventsSection.jsx`
- `FansSection.jsx`
- `Footer.jsx`
- `TicketViewCard.jsx`
- `HomePage.jsx`
- `HandleEmail.jsx`
- `JoinTheResistance.jsx`
- `SearchBar.jsx`
- `App.jsx`
- `main.jsx`
- `VenuesSection.jsx`
- `VenueDashboard.jsx`
- `Home.jsx`

## Learning Focus

- Build an API server with Express
- Handle body/query/path params
- Implement authentication and cookies (server + client)
- Hash/verify passwords with bcrypt
- Write unit/integration tests in Express
- Final Checkpoint: RESTful API that serves and mutates book/event
  data (CSV or DB backed)

## Teaching & Response Style

### Checkpoint Response Method

Each lesson or step should follow: - **Do** --- Implementation step -
**Expect** --- What the code does, why it works, alternatives - **If
not** --- What to check if it fails

### Other Requirements

- Prioritize completeness and teaching independence over brevity
- Explain concepts line-by-line when introducing new code
- Break large responses into manageable chunks but do not omit steps

## Design/UX Principles

- WWII-style resistance poster backgrounds
- Fonts: _Special Elite_ (headings), _Inter_ (body text)
- Replace emojis with gritty SVG/punk icons
- Buttons styled as grunge/neon with hover animation
- Input fields styled like terminal/typewriter
- Confirmation states themed as secret-society badges/stamps
- Animations (entrance, hover flicker)
- Optional punk ambient sound toggle

## Agents and Roles

- **CTO Guidance** --- Development & architecture
- **UI/UX Designer** --- Styling & CSS consistency
- **Product Manager** --- Roadmap & user story development
- **Marketing/Growth Hacker** --- Campaigns, virality, waitlist growth
- **Legal Counsel** --- Corporate structure, IP protection, compliance

## Current Roadmap Priorities

1.  **Sprint 1**: Live Event Search (via Google Events API or Sherpa
    API) + Waitlist CTA
2.  **Fan Advocacy Email**: Fans request venues to adopt Unchained
3.  **Next**: Venue Dashboard & Ticket Minting Interface
4.  **Future**: Expand marketplace, NFT ticket collectibles, fan rewards

## User Story Template

- As a (who)
- I want to (what)
- So that (why)

### Acceptance Criteria Format

- **Scenario**
- **Given**
- **When**
- **Then**
- **And**
