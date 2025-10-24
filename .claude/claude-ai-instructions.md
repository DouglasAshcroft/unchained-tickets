# Unchained – AI Coding Assistant Guide

**Full Reference:** For the comprehensive narrative guide, see `Archive/instructions.md`.

## Mission Snapshot
- **Goal**: Deliver a decentralized ticketing platform that eliminates fraud, curbs scalping, rewards loyal fans, and keeps control with artists/venues.[1][2][3]
- **Core Outcomes**: Authentic NFT tickets, resale rules via smart contracts, loyalty collectibles, analytics dashboards, and a community-focused discovery experience.[4][5][6][7][8][9]

## Platform Highlights
- **NFT Ticketing**: ERC-721 tickets with optional ERC-2981 royalties to route secondary-sale value back to creators; resale caps enforced on-chain.[4]
- **Authenticity**: On-chain provenance guarantees counterfeit resistance; venues verify ownership in real time at entry.[1]
- **Fan Experience**: Post-event collectibles, rewards for attendance, and fair-priced resale options foster engagement.[5][6]
- **Operations**: Dashboards surface ownership, transfers, and attendance insights for organizers and venues.[6][9]

## Tech Stack Essentials
- **Frontend**: React 18 + Vite, Tailwind CSS, React Router.[10]
- **Backend Delivery**: Node 18 + Express running as Vercel serverless functions.
- **Smart Contracts**: Solidity on Polygon via Hardhat/Thirdweb; contracts define ticket minting and royalties.[10][11][12]
- **Web3 Client**: ethers.js, Wagmi, RainbowKit, Coinbase Wallet SDK, optional Coinbase Onchain Kit.
- **Storage/Search**: NFT.Storage for IPFS-hosted metadata; Fuse.js for fuzzy event search; SerpAPI for Google Events ingestion.[16][18]
- **Hosting**: Vercel CI/CD with preview and production builds.[29][34][35][36][37][38]
- **AI Tooling**: Claude Code (Sonnet 4.5) and OpenAI Codex CLI support repository-aware coding workflows.[13][14][15][33]

## Repository Layout (Key Folders)
- `src/assets` — static imagery, icons, textures.
- `src/components` — reusable UI elements (`EventCard.jsx`, buttons, navigation).
- `src/pages` — route-level React components (`Home.jsx`, `EventDetail.jsx`, etc.).
- `src/utils` — helpers like `slugify.js`, map/link helpers, fetch utilities.[16]
- `src/styles` — Tailwind + custom CSS (`base`, `tokens`, `components`, `layout`, aggregated via `index.css`).[17][18][19][20][21]
- `src/App.jsx` / `src/main.jsx` — application shell and entry point.[22]
- Optional `src/api` — Vercel serverless routes when backend endpoints are required.
- Root configs — `package.json`, ESLint/Prettier settings, Hardhat contracts, `README.md` overview.[23][24]

## Coding Standards
- **Formatting**: Prettier defaults across the repo; run on save or pre-commit.[25]
- **Linting**: ESLint (Airbnb or recommended + Prettier) to catch bugs, hook misuse, naming issues.
- **Patterns**: Functional React components with hooks and Context; keep logic in utilities/hooks for reuse. `useFuseSearch` exemplifies encapsulated stateful logic.[26]
- **Design System**: Follow style guide tokens (colors, spacing, typography) and Tailwind utilities—maintain the “punk/underground” aesthetic.[17][18][19]
- **Accessibility**: Semantic HTML, ARIA where needed, keyboard navigation, WCAG AA contrast, descriptive `alt` text.[27]
- **Git Hygiene**: Clear commits (conventional style preferred), branches + reviews for major work, summarize AI-generated changes yourself.
- **Testing**: Target Jest/Vitest coverage for critical flows; mirror file structure for test files and manually exercise Web3 paths until automated tests land.

## User Perspectives (Implementers’ Checklist)
- **Fans**: Discover real events, mint authentic NFTs, retain collectible stubs, gain loyalty perks.[28]
- **Resellers**: Relist within contract-defined caps/royalties; fair pricing for buyers.[28]
- **Organizers**: Mint supply, control resale, view top supporters, launch targeted rewards.[28]
- **Venues**: Verify tickets instantly, view transfer/check-in analytics, plan staffing accordingly.[1][9]
- **Waitlist Users**: Join “Join The Resistance,” receive updates, early access, potential badge drops.[8]

## Documentation & Progress Tracking
- Maintain `PHASE[N]_COMPLETE.md` logs per migration/development phase.
- After each feature: record problem, solution, touched files (with links/lines), implementation notes, results, new dependencies, and build/test status (✅/🚧 indicators recommended).[90]
- Update logs immediately to keep onboarding context fresh and preserve long-running AI session history.

## Developer Workflow
- **Local Dev**: `npm install`, `npm run dev` (Vite @ `localhost:5173`); ensure wallet/testnet access (Polygon Mumbai or Hardhat node) and SerpAPI key in `.env` when live fetching.[106]
- **Build**: `npm run build` → `dist/`; verify via `npm run preview` before deployment.
- **Scripts**: `dev`, `build`, `lint`, `format`, `test`, optional `deploy`—prefer scripts/aliases over raw commands to minimize mistakes.
- **CLI Aliases**: Add shell aliases for frequent scripts (e.g., `alias dev="npm run dev"`) to accelerate loops.
- **AI Pairing**: Provide precise prompts + context, iterate quickly, validate output. Use AI for boilerplate but review as if from a junior teammate. Ask assistants to self-audit for bugs/edge cases.[30][31][32]
- **Prompt Library**: Capture successful prompts in a shared cheat sheet so humans/AI reuse effective patterns; mind context limits when pasting large snippets.[33]
- **CI Awareness**: Run `npm run lint && npm run test` before pushing; expect Vercel/GitHub Actions builds on protected branches.[245]

## Deployment Playbook (Vercel + Contracts)
1. **Prep**: Clean working tree, pass `npm run build`, ensure env vars (e.g., `SERPAPI_API_KEY`, RPC keys, contract addresses) are set in Vercel dashboard.[34]
2. **Deploy**: Push to main/production branch for auto-deploy, or run `vercel --prod` for manual promotion.[34][35][36]
3. **Verify**: Hit preview/production URL; test wallet flows, serverless routes, and console for errors.[36]
4. **Domains**: Add custom domains via Vercel settings; configure DNS CNAMEs, SSL auto-provisions.[37]
5. **Contracts**: Deploy Solidity upgrades via Hardhat/Thirdweb (`npx hardhat deploy --network polygon`), then update frontend constants (addresses/ABIs) before redeploying the web app.[144]
6. **Monitoring**: Use Vercel function logs, plus optional Sentry/LogRocket. Anticipate cold starts, cache event data for spikes, and consider queues for major on-sales.[147]

## Key Integrations at a Glance
- Polygon network for minting/validation.
- Wallet flows (RainbowKit, Coinbase Wallet, Onchain Kit).
- SerpAPI for event sourcing; cache/mock during dev to avoid rate limits.
- NFT.Storage for decentralized metadata; retain returned CIDs in contract metadata.
- Optional analytics (Google/Vercel) and future email or fiat on-ramps (SendGrid, MoonPay/Coinbase Pay) when required.[65][68][70][71]

## References
[1][3][27] `unchained_style_guide.md`  
[2][4][5][6][7][8][9][10][11][12][17][18][19][20][21][22][23][24][28] `README.md`  
[13][14][33] Claude Code — https://claudecode.io/  
[15] Codex CLI — https://github.com/openai/codex  
[16] `slugify.js`  
[25] Prettier — https://prettier.io/docs/  
[26] `useFuseSearch.js`  
[29][34][35][36][37][38] Vercel Deploy Guide — https://vercel.com/guides/deploying-react-with-vercel  
[30][31] AI Prompt Best Practices — https://statistician-in-stilettos.medium.com/best-practices-i-learned-for-ai-assisted-coding-70ff7359d403  
[32] Claude Sonnet 4.5 — https://www.anthropic.com/news/claude-sonnet-4-5
