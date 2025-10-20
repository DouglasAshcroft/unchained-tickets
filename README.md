# Unchained Tickets

Full-stack NFT ticketing platform built with Next.js 15, OnchainKit, and Prisma. This repository now centralizes all build guides, runbooks, and release notes under the `docs/` directory for quick reference.

## Quick Start
- Install dependencies: `npm install`
- Copy `.env.example` to `.env.local` and fill in secrets (never commit them)
- Run the dev server: `npm run dev`
- See `docs/setup/setup-guide.md` for detailed environment steps

## Documentation Map
- High-level index: [`docs/README.md`](docs/README.md)
- Setup and onboarding: `docs/setup/`
- Deployment and operations: `docs/operations/`
- Engineering practices and testing: `docs/engineering/`
- Product planning: `docs/product/`
- Release history: `docs/release-notes/`

Sensitive procedures and credential-specific instructions have been relocated to `internal/privileged/` (git-ignored). Public summaries live in `docs/internal/` so you always know where to find the private source.

## Contributing
Follow the linting and testing guidance in `docs/engineering/development-guidelines.md`. Open a PR with a summary of the docs you touched so reviewers can skim the right sections.
