# Legal Pages Implementation Guide

## ✅ Completed Components

### Core Infrastructure
1. ✅ **Role verification functions** (`lib/utils/auth.ts`)
   - `verifyArtist()` - Artists + Admins
   - `verifyVenue()` - Venues + Admins
   - `verifyArtistOrVenue()` - Artists, Venues + Admins

2. ✅ **Legal Page Layout** (`components/legal/LegalPageLayout.tsx`)
   - Responsive container with breadcrumbs
   - Print button
   - Consistent styling
   - Back navigation

3. ✅ **Legal Hub Page** (`app/legal/page.tsx`)
   - Lists all legal documents
   - Separates public and role-protected docs
   - Indicates which role is required for protected docs

4. ✅ **Updated Footer** (`components/layout/Footer.tsx`)
   - 4-column grid layout
   - Links to key legal pages
   - Organized by category

### Example Implementations

**Public Page Example:**
- ✅ Content: `components/legal/TOSContent.tsx`
- ✅ Route: `app/legal/terms/page.tsx`

**Role-Protected Page Example:**
- ✅ Content: `components/legal/ArtistAgreementContent.tsx`
- ✅ Route: `app/legal/artist-agreement/page.tsx` (with access control)

---

## 📋 Remaining Work

### Content Components to Create

Extract content from `docs/operations/legal.md` sections:

**Public Components (8 remaining):**
1. `components/legal/PrivacyContent.tsx` - Section 2
2. `components/legal/CookieContent.tsx` - Section 3
3. `components/legal/CommunityGuidelinesContent.tsx` - Section 4
4. `components/legal/DMCAContent.tsx` - Section 5
5. `components/legal/UserAgreementContent.tsx` - Section 9
6. `components/legal/RefundsContent.tsx` - Section 11
7. `components/legal/AccessibilityContent.tsx` - Section 13
8. `components/legal/FeesContent.tsx` - Section 15

**Role-Protected Components (5 remaining):**
9. `components/legal/VenueAgreementContent.tsx` - Section 7 (Venue only)
10. `components/legal/EventListingContent.tsx` - Section 8 (Venue only)
11. `components/legal/PaymentTermsContent.tsx` - Section 10 (Artist/Venue)
12. `components/legal/DPAContent.tsx` - Section 12 (Artist/Venue)
13. `components/legal/ContractorContent.tsx` - Section 14 (Artist/Venue)

### Page Routes to Create

**Public Routes (8 remaining):**
1. `app/legal/privacy/page.tsx`
2. `app/legal/cookies/page.tsx`
3. `app/legal/community-guidelines/page.tsx`
4. `app/legal/dmca/page.tsx`
5. `app/legal/user-agreement/page.tsx`
6. `app/legal/refunds/page.tsx`
7. `app/legal/accessibility/page.tsx`
8. `app/legal/fees/page.tsx`

**Role-Protected Routes (5 remaining):**
9. `app/legal/venue-agreement/page.tsx` (Venue only)
10. `app/legal/event-listing-agreement/page.tsx` (Venue only)
11. `app/legal/payment-terms/page.tsx` (Artist/Venue)
12. `app/legal/data-processing/page.tsx` (Artist/Venue)
13. `app/legal/contractor-agreement/page.tsx` (Artist/Venue)

---

## 🎯 Implementation Templates

### Template 1: Public Content Component

```tsx
export function [NAME]Content() {
  return (
    <div className="space-y-8">
      {/* Optional disclaimer box */}
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-8">
        <p className="text-sm text-yellow-200">
          <strong>Note:</strong> Disclaimer text here
        </p>
      </div>

      {/* Section from legal.md */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Section Title</h2>
        <p className="mb-4">
          Content text here...
        </p>

        <h3 className="text-xl font-semibold mb-3">Subsection</h3>
        <p className="mb-4">
          More content...
        </p>

        {/* Lists if applicable */}
        <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
          <li>List item 1</li>
          <li>List item 2</li>
        </ul>
      </section>

      {/* Repeat for all sections */}
    </div>
  );
}
```

### Template 2: Public Page Route

```tsx
import { [NAME]Content } from '@/components/legal/[NAME]Content';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '[Page Title] | Unchained',
  description: '[Page description]',
};

export default function [NAME]Page() {
  return (
    <LegalPageLayout title="[Page Title]">
      <[NAME]Content />
    </LegalPageLayout>
  );
}
```

### Template 3: Role-Protected Page Route

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { [NAME]Content } from '@/components/legal/[NAME]Content';
import { LegalPageLayout } from '@/components/legal/LegalPageLayout';
import Link from 'next/link';

export default function [NAME]Page() {
  const { user, isLoading } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        window.location.href = '/login?redirect=/legal/[route]';
      } else if (
        // Adjust role check based on requirements:
        // For Artist only: user.role !== 'artist' && user.role !== 'admin'
        // For Venue only: user.role !== 'venue' && user.role !== 'admin'
        // For Artist/Venue: user.role !== 'artist' && user.role !== 'venue' && user.role !== 'admin'
        user.role !== '[REQUIRED_ROLE]' && user.role !== 'admin'
      ) {
        setHasAccess(false);
      } else {
        setHasAccess(true);
      }
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resistance-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8 text-center">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4">Access Restricted</h1>
          <p className="text-gray-400 mb-6">
            This document is only available to registered <strong>[ROLE NAME]</strong>.
            If you need access to this agreement, please contact support.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/legal"
              className="px-6 py-3 bg-[var(--bg-secondary)] border border-white/10 rounded-lg hover:border-resistance-500/50 transition-all"
            >
              Back to Legal Documents
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 bg-resistance-500 hover:bg-resistance-600 rounded-lg transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LegalPageLayout title="[Page Title]">
      <[NAME]Content />
    </LegalPageLayout>
  );
}
```

---

## 🔨 Quick Implementation Steps

### Step 1: Create Content Components

For each legal document section in `docs/operations/legal.md`:

1. Create a new file in `components/legal/`
2. Copy the EXACT content from the corresponding section
3. Apply JSX/HTML formatting (headings, paragraphs, lists)
4. Add Tailwind classes for styling
5. **DO NOT modify the legal text content**

### Step 2: Create Page Routes

For each legal document:

1. Create directory: `mkdir app/legal/[route-name]`
2. Create `page.tsx` in that directory
3. Use Template 2 (public) or Template 3 (role-protected)
4. Import the corresponding content component
5. Add appropriate metadata

### Step 3: Test Access Controls

**Public pages** - Should be accessible without login:
- /legal/terms
- /legal/privacy
- /legal/cookies
- /legal/community-guidelines
- /legal/dmca
- /legal/refunds
- /legal/fees
- /legal/accessibility
- /legal/user-agreement

**Artist-only pages** - Require artist or admin role:
- /legal/artist-agreement

**Venue-only pages** - Require venue or admin role:
- /legal/venue-agreement
- /legal/event-listing-agreement

**Artist/Venue pages** - Require artist, venue, or admin role:
- /legal/payment-terms
- /legal/data-processing
- /legal/contractor-agreement

---

## ✅ Testing Checklist

- [ ] All public legal pages load without authentication
- [ ] Role-protected pages redirect to login when not authenticated
- [ ] Role-protected pages show access denied for wrong roles
- [ ] Admins can access all role-protected pages
- [ ] Footer links work correctly
- [ ] Legal hub page lists all documents
- [ ] Print button works on all pages
- [ ] Mobile responsive on all pages
- [ ] Dark mode works correctly
- [ ] Breadcrumb navigation works
- [ ] "Back to Legal Documents" links work

---

## 🚀 Next Steps After Completion

1. **Legal Review**: Have counsel review all content for accuracy
2. **Update Placeholders**: Replace `[Company Name]`, `[State]`, email addresses, etc.
3. **Add Last Updated Dates**: Add actual dates to each page
4. **SEO**: Add proper meta descriptions
5. **Analytics**: Set up page view tracking
6. **Acceptance Tracking**: Implement user agreement acceptance logging (future phase)
7. **PDF Generation**: Add download PDF functionality (future phase)

---

## 📝 File Mapping Reference

| Section | Content Component | Page Route | Role Required |
|---------|-------------------|------------|---------------|
| 1. TOS | ✅ TOSContent.tsx | ✅ /terms | Public |
| 2. Privacy | PrivacyContent.tsx | /privacy | Public |
| 3. Cookies | CookieContent.tsx | /cookies | Public |
| 4. Community | CommunityGuidelinesContent.tsx | /community-guidelines | Public |
| 5. DMCA | DMCAContent.tsx | /dmca | Public |
| 6. Artist | ✅ ArtistAgreementContent.tsx | ✅ /artist-agreement | Artist |
| 7. Venue | VenueAgreementContent.tsx | /venue-agreement | Venue |
| 8. Event Listing | EventListingContent.tsx | /event-listing-agreement | Venue |
| 9. User | UserAgreementContent.tsx | /user-agreement | Public |
| 10. Payment | PaymentTermsContent.tsx | /payment-terms | Artist/Venue |
| 11. Refunds | RefundsContent.tsx | /refunds | Public |
| 12. DPA | DPAContent.tsx | /data-processing | Artist/Venue |
| 13. Accessibility | AccessibilityContent.tsx | /accessibility | Public |
| 14. Contractor | ContractorContent.tsx | /contractor-agreement | Artist/Venue |
| 15. Fees | FeesContent.tsx | /fees | Public |

---

## 💡 Pro Tips

1. **Content Extraction**: Open `docs/operations/legal.md` in one window and the component file in another for easy reference
2. **Styling Consistency**: Copy the structure from `TOSContent.tsx` or `ArtistAgreementContent.tsx` for consistent formatting
3. **Batch Creation**: Create all content components first, then all page routes
4. **Test As You Go**: Test each page immediately after creating it
5. **Use Git**: Commit after completing each major section

---

## 🎯 Estimated Time

- Content Components: ~15-20 minutes each = 3-4 hours total
- Page Routes: ~5-10 minutes each = 1-2 hours total
- Testing: ~1 hour
- **Total: 5-7 hours**

---

## 📞 Support

If you encounter issues:
1. Check the example implementations (TOS and Artist Agreement)
2. Verify file paths and imports
3. Test role verification in `lib/utils/auth.ts`
4. Check console for any errors
