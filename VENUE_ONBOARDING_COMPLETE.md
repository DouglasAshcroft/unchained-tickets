# Venue Onboarding Completion Highlights

- **Event creation wizard** (`/events/new`): multi-step flow with poster uploads (file or URL), fuzzy venue selection, Base Paymaster messaging, and draft/publish support via the events API.
- **Venue dashboard beta** (`/dashboard/venue`): rendered through `VenueDashboardService`, which aggregates live Prisma data when available and falls back to mocks during development.
- **Role-aware navigation**: navbar links respond to the connected wallet’s role, routing venue/admin users to the dashboard after login while other users land on the events catalog.
- **Wallet-first gating**: the venue dashboard requires a connected Base wallet and venue/admin role. Server-side API RBAC enforcement is next on the roadmap.
