# Unchained Tickets Documentation Index

## ⚠️ Security Notice

**Most documentation is currently hidden pending security audit.**

During rapid AI-assisted development, sensitive credentials were accidentally committed to documentation. While the immediate issue was resolved (wallet burned, funds recovered), we are conducting a thorough audit of all documentation before making it public again.

**Currently Public:**
- `/docs/setup/` - Setup and configuration guides
- This README

**Temporarily Hidden:**
- All deployment documentation
- Operations and internal documentation
- Product and engineering documentation
- Release notes and feature docs

This is a precautionary measure for the hackathon. Full documentation will be restored after security review.

For immediate needs:
- **Setup:** See `/docs/setup/` directory
- **Security Audit Status:** See `/docs/setup/SECURITY_AUDIT_TODO.md`

---

Use this index to jump to the right reference quickly. Folders are organized by use case; highlighted documents are the ones you will reach for most often.

## Overview
- [Base Ecosystem Strategy](overview/base-ecosystem-strategy.md)
- [Development Log](overview/dev-log.md)
- [Status Check](overview/status-check.md)

## Setup & Local Environment
- [Getting Started](setup/setup-guide.md)
- [Startup Checklist](setup/startup-guide.md)
- [Dev Mode Guide](setup/dev-mode-guide.md)
- [Docker Setup](setup/docker-setup.md)
- [Base OnchainKit Integration Notes](setup/base-onchainkit-integration.md)
- [Custom Domain Setup](setup/custom-domain-setup.md)

## Operations & Deployment
- [Production Deployment Guide](operations/production-deployment-guide.md)
- [Deployment Plan](operations/deployment-plan.md)
- [Deployment Checklist](operations/deployment-checklist.md)
- [Mainnet Deployment](operations/mainnet-deployment.md)
- [Production Runbook Summary](internal/security/runbook-overview.md)
- [Monitoring Setup](operations/monitoring-setup.md)
- [Perk System in Production](operations/perk-system-production.md)

## Engineering Practices
- [Development Guidelines](engineering/development-guidelines.md)
- [Database Optimization](engineering/database-optimization.md)
- [API Error Handling](engineering/api-error-handling.md)
- [Performance Optimization](engineering/performance-optimization.md)
- [Performance Remediation Plan](engineering/performance-remediation-plan.md)
- [Lighthouse Benchmarks](engineering/lighthouse-benchmarks.md)

### Testing
- [Test Infrastructure](engineering/testing/test-infrastructure.md)
- [E2E Testing Guide](engineering/testing/e2e-testing-guide.md)
- [Minting Test Guide](engineering/testing/minting-test-guide.md)
- [Private Test Minting Notes](internal/risk/test-minting-flow-notes.md)

## Product & Roadmap
- [Venue Onboarding Epic](product/venue-onboarding-epic.md)
- [Venue Onboarding Roadmap](product/venue-onboarding-roadmap.md)
- [Phase 3 Frontend Migration Plan](product/phase-3-frontend-migration-plan.md)
- [Developer Backlog](product/developer-backlog.md)

## Release Notes & Incident Fixes
Browse `docs/release-notes/` for milestone summaries and hotfixes. Highlights:
- [Phase 1 Core Functionality Complete](release-notes/2025-10-10-phase-1-core-functionality-complete.md)
- [Phase 2 Performance Optimization](release-notes/2025-10-10-phase-2-performance-optimization.md)
- [Poster Upload Fix](release-notes/2025-10-10-poster-upload-fix.md)
- [SSR Wallet Fix](release-notes/2025-01-ssr-wallet-fix.md)
- [Coinbase Onramp Progress](release-notes/2025-10-coinbase-onramp-progress.md)
- [Coinbase Onramp Completion](release-notes/2025-10-coinbase-onramp-complete.md)

## Internal Notes (Keep Private)
These files stay in the repo but should not be published externally.
- [AI Assistant Instructions](internal/ai/claude-ai-instructions.md)
- [Copilot Instructions](internal/ai/copilot-instructions.md)
- [Admin Access Summary](internal/security/admin-access-procedure.md)
- [Pre-Production Checklist Summary](internal/risk/pre-production-checklist.md)

Detailed credential handling, security runbooks, and redacted test guides live under `internal/privileged/` (ignored by git). Request access from the maintainer before sharing sensitive material.

## Legacy Archive
Historical planning artifacts and deprecated docs are stored in [`docs/archive/legacy/`](archive/legacy). Keep them for reference only.
