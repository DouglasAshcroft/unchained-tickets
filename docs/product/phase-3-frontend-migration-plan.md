# Phase 3: Frontend Component Migration Plan

## Current Frontend Analysis (Vite + React)

### Key Components to Migrate
1. **Layout Components**
   - Navbar (with wallet integration)
   - Footer
   - ThemeToggle

2. **Page Components**
   - JoinTheResistance (Home/Landing page)
   - EventsSection (Events listing)
   - TicketViewCard (Event detail page)
   - VenuesSection (Venue detail pages)
   - ArtistsSection (Artist detail pages)
   - FansSection (Fan profile/dashboard)

3. **Feature Components**
   - EventCard
   - EventList
   - SearchBar
   - Checkout
   - QRCodes

4. **UI Components**
   - Button
   - Badge
   - Card
   - Modal

5. **Providers**
   - AuthProvider
   - DataProvider (API client)
   - ThemeProvider
   - SearchProvider
   - ToastProvider

## Migration Strategy

### Step 1: Foundation (API Client & Providers)
- Create API client utilities using fetch/axios
- Set up React Query for data fetching
- Migrate AuthProvider to work with new backend
- Set up OnchainKit providers

### Step 2: Base Layout
- Create root layout with Navbar + Footer
- Integrate OnchainKit wallet components
- Set up theme system (light/dark mode)

### Step 3: Core Pages (Next.js App Router)
```
app/
├── (home)/
│   └── page.tsx              # Landing page
├── events/
│   ├── page.tsx              # Events listing
│   └── [slug]/
│       └── page.tsx          # Event detail
├── venues/
│   └── [slug]/
│       └── page.tsx          # Venue detail
├── artists/
│   └── [slug]/
│       └── page.tsx          # Artist detail
└── profile/
    └── page.tsx              # Fan dashboard
```

### Step 4: Component Migration Order
1. ✅ UI components (Button, Badge, Card, Modal)
2. ✅ EventCard component
3. ✅ SearchBar component
4. ✅ Navbar with OnchainKit wallet
5. ✅ Footer
6. ✅ Landing page
7. ✅ Events listing page
8. ✅ Event detail page
9. ✅ Venue/Artist pages
10. ✅ Checkout flow with Web3 payments

## Key Differences in Next.js

### Routing
**Old (React Router):**
```jsx
<Route path="/Home/Events/TicketView/:slug" element={<TicketViewCard />} />
```

**New (Next.js App Router):**
```
app/events/[slug]/page.tsx
```

### Data Fetching
**Old (useEffect + fetch):**
```jsx
const [events, setEvents] = useState([]);
useEffect(() => {
  fetch('/api/events').then(r => r.json()).then(setEvents);
}, []);
```

**New (React Query):**
```tsx
const { data: events } = useQuery({
  queryKey: ['events'],
  queryFn: () => api.getEvents()
});
```

### Client vs Server Components
- Server Components: Default for pages, good for SEO
- Client Components: Use `'use client'` for interactivity

## OnchainKit Integration Points

1. **Navbar**: Add `<ConnectWallet />` button
2. **Event Detail**: Show `<Identity />` for artist/venue verification
3. **Checkout**: Use `<Transaction />` for NFT ticket minting
4. **Checkout**: Use `<Checkout />` for USDC payments
5. **Profile**: Display `<Avatar />` and `<Name />` for user

## Timeline Estimate

- **Step 1**: API Client & Providers - 1 hour
- **Step 2**: Base Layout - 1 hour
- **Step 3**: Core Pages Structure - 30 min
- **Step 4**: Component Migration - 4 hours
- **Total**: ~6-7 hours

## Dependencies to Add

```bash
npm install @tanstack/react-query
npm install react-hot-toast  # For notifications
npm install date-fns  # For date formatting
```

---

**Status:** Ready to begin
**Next Action:** Create API client utilities
