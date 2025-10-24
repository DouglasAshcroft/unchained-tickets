# Sprint 1b: Integration Plan
**Status**: Ready to Execute
**Estimated Time**: 4-6 hours
**Goal**: Reduce page.tsx from 2400 lines to ~200-300 lines using extracted components/hooks

---

## Overview

This document provides a step-by-step plan to integrate the 13 extracted components/hooks (407 tests) into the monolithic page.tsx file.

**Current State**:
- page.tsx: 2400 lines (monolithic)
- Extracted pieces: 13 components/hooks with 407 passing tests
- Pieces exist but aren't used - duplicated logic in both places

**Target State**:
- page.tsx: ~200-300 lines (orchestrator only)
- All logic delegated to custom hooks
- All UI delegated to step components
- Zero duplication

---

## Phase 1: Preparation & Backup

### 1.1 Create Backup
```bash
cp app/events/new/page.tsx app/events/new/page.tsx.backup
git add app/events/new/page.tsx.backup
git commit -m "backup: preserve original page.tsx before integration"
```

### 1.2 Verify All Tests Pass Before Starting
```bash
npm run test -- app/events/new
# Should show: 407 tests passing
```

### 1.3 Run TypeScript and Lint Checks
```bash
npx tsc --noEmit --skipLibCheck
npm run lint
# Both should pass with zero errors
```

---

## Phase 2: Remove Duplicate Type Definitions

**Problem**: page.tsx duplicates types that exist in `types.ts`

### 2.1 Remove Duplicate Type Definitions (Lines 19-44)
**Delete these types** (already exist in `types.ts`):
- `PricingType`
- `TicketPerkForm`
- `TicketTypeForm`
- `WizardStep`
- `StepDefinition`

**Keep** these types (page-specific):
- `VenueOption` (if not in types.ts)
- `ArtistOption` (if not in types.ts)
- `FormState`
- `FormErrors`
- `PosterVariant`

### 2.2 Remove Duplicate Utility Functions (Lines 46-73)
**Delete these functions** (already exist in `useEventFormState` hook):
- `generateTicketTypeId()`
- `generateTicketPerkId()`
- `createEmptyTicketPerk()`
- `createEmptyTicketType()`

### 2.3 Remove Duplicate Constants (Lines 75-100)
**Delete**: `steps` array (already exists in `types.ts` as `WIZARD_STEPS`)

### 2.4 Add Imports
```typescript
import type {
  FormState,
  TicketTypeForm,
  TicketPerkForm,
  PosterVariant,
  WIZARD_STEPS,
} from './types';
```

**Verification**:
```bash
npx tsc --noEmit --skipLibCheck
# Should pass - no type errors from removing duplicates
```

---

## Phase 3: Replace State Management with Custom Hooks

**Problem**: page.tsx has 16+ useState hooks that duplicate logic in custom hooks

### 3.1 Import Custom Hooks
```typescript
import { useEventFormState } from './hooks/useEventFormState';
import { useEventValidation } from './hooks/useEventValidation';
import { useWizardNavigation } from './hooks/useWizardNavigation';
import { usePosterFile } from './hooks/usePosterFile';
```

### 3.2 Replace Form State Hook
**Remove** (Line 210):
```typescript
const [formData, setFormData] = useState<FormState>(initialState);
```

**Replace with**:
```typescript
const {
  formData,
  updateField,
  addTicketType,
  updateTicketField,
  removeTicketType,
  addPerkToTicket,
  updatePerkField,
  removePerkFromTicket,
  addPosterVariant,
  approvePosterVariant,
  updatePosterVariantImage,
} = useEventFormState();
```

### 3.3 Replace Validation Hook
**Remove** (Line 211):
```typescript
const [errors, setErrors] = useState<FormErrors>({});
```

**Replace with**:
```typescript
const { errors, validateStep, clearErrors } = useEventValidation(formData);
```

### 3.4 Replace Wizard Navigation Hook
**Remove** (Line 209):
```typescript
const [currentStepIndex, setCurrentStepIndex] = useState(0);
const currentStep = steps[currentStepIndex];
```

**Replace with**:
```typescript
const {
  currentStepIndex,
  currentStep,
  handleNext,
  handleBack,
  goToStep,
  canNavigateNext,
  canNavigateBack,
} = useWizardNavigation({ validateStep, clearErrors });
```

### 3.5 Replace Poster File Hook
**Remove** (Lines 212-214):
```typescript
const [posterFile, setPosterFile] = useState<File | null>(null);
const [posterPreview, setPosterPreview] = useState<string | null>(null);
const [isDraggingPoster, setIsDraggingPoster] = useState(false);
```

**Replace with**:
```typescript
const {
  posterFile,
  posterPreview,
  isDragging: isDraggingPoster,
  handleFileSelect,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  clearFile: clearPosterFile,
  error: posterFileError,
} = usePosterFile();
```

### 3.6 Keep Page-Specific State
**Keep these** (needed for search/suggestions UI):
```typescript
const [venueQuery, setVenueQuery] = useState("");
const [selectedVenue, setSelectedVenue] = useState<VenueOption | null>(null);
const [showVenueSuggestions, setShowVenueSuggestions] = useState(false);
const [artistQuery, setArtistQuery] = useState("");
const [selectedArtist, setSelectedArtist] = useState<ArtistOption | null>(null);
const [showArtistSuggestions, setShowArtistSuggestions] = useState(false);
const [mapsLocked, setMapsLocked] = useState(false);
const [selectedPosterStyle, setSelectedPosterStyle] = useState<string>("");
const [isGeneratingPosters, setIsGeneratingPosters] = useState(false);
```

**Verification**:
```bash
npx tsc --noEmit --skipLibCheck
# Should pass - hooks provide correct interfaces
```

---

## Phase 4: Replace Inline Functions with Hook Methods

**Problem**: page.tsx has 50+ inline functions that duplicate hook logic

### 4.1 Remove Form Update Functions
**Delete** all these inline functions:
- `handleFieldChange()` → use `updateField()` from hook
- `handleTicketFieldChange()` → use `updateTicketField()` from hook
- `handleAddTicketType()` → use `addTicketType()` from hook
- `handleRemoveTicketType()` → use `removeTicketType()` from hook
- `handleAddPerk()` → use `addPerkToTicket()` from hook
- `handleRemovePerk()` → use `removePerkFromTicket()` from hook
- `handlePerkFieldChange()` → use `updatePerkField()` from hook

### 4.2 Remove Navigation Functions
**Delete**:
- `handleNext()` → provided by `useWizardNavigation`
- `handleBack()` → provided by `useWizardNavigation`
- `goToStep()` → provided by `useWizardNavigation`

### 4.3 Remove Poster File Functions
**Delete**:
- `handlePosterFileChange()` → use `handleFileSelect()` from hook
- `handlePosterDragOver()` → use `handleDragOver()` from hook
- `handlePosterDragLeave()` → use `handleDragLeave()` from hook
- `handlePosterDrop()` → use `handleDrop()` from hook
- `clearPosterFile()` → use `clearFile()` from hook

### 4.4 Keep Page-Specific Functions
**Keep** these (search/suggestion UI specific to page):
- `handleVenueInputChange()`
- `handleVenueSelect()`
- `clearSelectedVenue()`
- `handleArtistInputChange()`
- `handleArtistSelect()`
- `clearSelectedArtist()`
- `toggleMapsLock()`
- `handleStartTimeChange()`
- `handleEndTimeChange()`

**Verification**:
```bash
npx tsc --noEmit --skipLibCheck
# Should pass - all function signatures match
```

---

## Phase 5: Replace Render Functions with Step Components

**Problem**: page.tsx has 5 massive render functions (Lines 990-2100) that duplicate step component logic

### 5.1 Import Step Components
```typescript
import { BasicsStep } from './components/steps/BasicsStep';
import { ScheduleStep } from './components/steps/ScheduleStep';
import { TicketsStep } from './components/steps/TicketsStep';
import { PostersStep } from './components/steps/PostersStep';
import { ReviewStep } from './components/steps/ReviewStep';
```

### 5.2 Replace renderBasicsStep()
**Delete** entire function (Lines ~990-1150)

**Replace with**:
```typescript
const renderBasicsStep = () => (
  <BasicsStep
    formData={{
      title: formData.title,
      primaryArtistId: formData.primaryArtistId,
      posterImageUrl: formData.posterImageUrl,
      externalLink: formData.externalLink,
    }}
    errors={errors}
    artists={artists.map(a => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      genre: a.genre || null,
    }))}
    selectedArtist={selectedArtist ? {
      id: selectedArtist.id,
      name: selectedArtist.name,
      slug: selectedArtist.slug,
      genre: selectedArtist.genre || null,
    } : null}
    posterFile={posterFile}
    posterPreview={posterPreview}
    handlers={{
      onFieldChange: updateField,
      onArtistSelect: (artist) => {
        handleArtistSelect({
          id: artist.id,
          name: artist.name,
          slug: artist.slug,
          genre: artist.genre || undefined,
        });
      },
      onPosterFileChange: handleFileSelect,
      onClearPoster: clearFile,
    }}
  />
);
```

### 5.3 Replace renderScheduleStep()
**Delete** entire function (Lines ~1150-1350)

**Replace with**:
```typescript
const renderScheduleStep = () => (
  <ScheduleStep
    formData={{
      startsAt: formData.startsAt,
      endsAt: formData.endsAt,
      venueId: formData.venueId,
      mapsLink: formData.mapsLink,
    }}
    errors={errors}
    venues={venues.map(v => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      city: v.city || null,
      state: v.state || null,
      capacity: null,
    }))}
    selectedVenue={selectedVenue ? {
      id: selectedVenue.id,
      name: selectedVenue.name,
      slug: selectedVenue.slug,
      city: selectedVenue.city || null,
      state: selectedVenue.state || null,
      capacity: null,
    } : null}
    mapsLocked={mapsLocked}
    handlers={{
      onFieldChange: updateField,
      onStartTimeChange: handleStartTimeChange,
      onEndTimeChange: handleEndTimeChange,
      onVenueSelect: handleVenueSelect,
      onToggleMapsLock: toggleMapsLock,
    }}
  />
);
```

### 5.4 Replace renderTicketsStep()
**Delete** entire function (Lines ~1350-1650)

**Replace with**:
```typescript
const renderTicketsStep = () => (
  <TicketsStep
    ticketTypes={formData.ticketTypes}
    errors={errors}
    selectedVenue={selectedVenue ? {
      id: selectedVenue.id,
      name: selectedVenue.name,
      slug: selectedVenue.slug,
      city: selectedVenue.city || null,
      state: selectedVenue.state || null,
      capacity: null,
    } : null}
    handlers={{
      onAddTicket: addTicketType,
      onRemoveTicket: removeTicketType,
      onUpdateTicket: updateTicketField,
      onAddPerk: addPerkToTicket,
      onUpdatePerk: updatePerkField,
      onRemovePerk: removePerkFromTicket,
    }}
  />
);
```

### 5.5 Replace renderPostersStep()
**Delete** entire function (Lines ~1650-1900)

**Replace with**:
```typescript
const renderPostersStep = () => (
  <PostersStep
    formData={formData}
    selectedStyle={selectedPosterStyle}
    posterVariants={formData.posterVariants}
    isGenerating={isGeneratingPosters}
    handlers={{
      onStyleSelect: setSelectedPosterStyle,
      onGeneratePoster: async () => {
        // Keep existing generation logic here for now
        // TODO: Extract to hook in future refactoring
      },
      onApprovePoster: approvePosterVariant,
      onSkip: () => {
        handleNext();
      },
    }}
  />
);
```

### 5.6 Replace renderReviewStep()
**Delete** entire function (Lines ~1900-2100)

**Replace with**:
```typescript
const renderReviewStep = () => (
  <ReviewStep
    formData={formData}
    selectedArtist={selectedArtist ? {
      id: selectedArtist.id,
      name: selectedArtist.name,
      slug: selectedArtist.slug,
      genre: selectedArtist.genre || null,
    } : null}
    selectedVenue={selectedVenue ? {
      id: selectedVenue.id,
      name: selectedVenue.name,
      slug: selectedVenue.slug,
      city: selectedVenue.city || null,
      state: selectedVenue.state || null,
      capacity: null,
    } : null}
  />
);
```

**Verification**:
```bash
npx tsc --noEmit --skipLibCheck
npm run test -- app/events/new
# Both should pass
```

---

## Phase 6: Clean Up and Remove Dead Code

### 6.1 Remove Unused Imports
**Delete imports** no longer needed:
- `Image` from "next/image" (if not used elsewhere)
- `Input` from "@/components/ui/Input" (step components use it instead)
- Any other UI components only used in deleted render functions

### 6.2 Remove Unused Constants
**Delete**:
- `initialState` (now in `useEventFormState`)
- Any validation constants (now in `useEventValidation`)

### 6.3 Remove Unused Helper Functions
**Delete** any remaining helper functions that are now in hooks

### 6.4 Verify Minimal Imports
**Final imports should be**:
```typescript
"use client";
import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { addHours } from "date-fns";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { api } from "@/lib/api/client";

// Custom hooks
import { useEventFormState } from './hooks/useEventFormState';
import { useEventValidation } from './hooks/useEventValidation';
import { useWizardNavigation } from './hooks/useWizardNavigation';
import { usePosterFile } from './hooks/usePosterFile';

// Step components
import { BasicsStep } from './components/steps/BasicsStep';
import { ScheduleStep } from './components/steps/ScheduleStep';
import { TicketsStep } from './components/steps/TicketsStep';
import { PostersStep } from './components/steps/PostersStep';
import { ReviewStep } from './components/steps/ReviewStep';

// Types
import type { VenueOption, ArtistOption } from './types';
```

**Verification**:
```bash
npx tsc --noEmit --skipLibCheck
npm run lint
# Both should pass with zero warnings
```

---

## Phase 7: Testing

### 7.1 Run All Tests
```bash
npm run test -- app/events/new
# Should still show 407 tests passing
```

### 7.2 Run TypeScript and Lint
```bash
npx tsc --noEmit --skipLibCheck
npm run lint
# Both should pass
```

### 7.3 Manual Testing Checklist
Start dev server and test each step:

**Basics Step**:
- [ ] Enter event title
- [ ] Search and select artist
- [ ] Upload poster file
- [ ] Enter poster URL
- [ ] Enter external link
- [ ] Validation errors display correctly
- [ ] Click "Next" advances to schedule

**Schedule Step**:
- [ ] Select start date/time
- [ ] Select end date/time (auto-fills 2 hours ahead)
- [ ] Search and select venue
- [ ] Maps link auto-fills
- [ ] Toggle maps lock works
- [ ] Validation errors display correctly
- [ ] Click "Next" advances to tickets

**Tickets Step**:
- [ ] Add ticket type button works
- [ ] Remove ticket type works (can't remove last)
- [ ] Update ticket fields (name, price, capacity)
- [ ] Add perk to ticket works
- [ ] Remove perk works
- [ ] Capacity warning shows when over venue limit
- [ ] Validation errors display correctly
- [ ] Click "Next" advances to posters

**Posters Step**:
- [ ] Select poster style
- [ ] Generate posters button works
- [ ] Loading state shows during generation
- [ ] Preview displays generated posters
- [ ] Approve poster works
- [ ] Skip button works
- [ ] Click "Next" advances to review

**Review Step**:
- [ ] Event details display correctly
- [ ] Schedule displays correctly
- [ ] Tickets display correctly with pricing
- [ ] Total capacity calculates correctly
- [ ] Click "Create Event" submits

**Navigation**:
- [ ] Progress indicator shows current step
- [ ] Back button works (except on first step)
- [ ] Can't skip steps (validation blocks)
- [ ] Can jump to completed steps

**Validation**:
- [ ] Can't proceed with empty required fields
- [ ] Error messages are clear
- [ ] Errors clear when fields are corrected

### 7.4 Verify Line Count Reduction
```bash
wc -l app/events/new/page.tsx
# Should show ~200-300 lines (down from 2400)
```

---

## Phase 8: Final Commit

### 8.1 Git Status Check
```bash
git status
# Should show:
# - modified: app/events/new/page.tsx (massive reduction)
# - new: app/events/new/page.tsx.backup
```

### 8.2 Create Comprehensive Commit
```bash
git add app/events/new/page.tsx app/events/new/page.tsx.backup

git commit -m "feat: complete Sprint 1b - integrate components and hooks into NewEventPage

## Integration Complete
Reduced page.tsx from 2400 lines to ~XXX lines by integrating all extracted
components and hooks created in Sprint 1a.

## Changes Made

### Removed Duplicates
- Removed duplicate type definitions (now import from types.ts)
- Removed duplicate utility functions (now in useEventFormState hook)
- Removed duplicate constants (now use WIZARD_STEPS from types.ts)

### State Management Replacement
- Replaced 16+ useState hooks with 4 custom hooks:
  - useEventFormState (form data and CRUD operations)
  - useEventValidation (all validation logic)
  - useWizardNavigation (wizard state and navigation)
  - usePosterFile (file upload handling)

### UI Replacement
- Replaced 5 massive render functions with step components:
  - renderBasicsStep() → <BasicsStep />
  - renderScheduleStep() → <ScheduleStep />
  - renderTicketsStep() → <TicketsStep />
  - renderPostersStep() → <PostersStep />
  - renderReviewStep() → <ReviewStep />

## Impact
- **Lines reduced**: 2400 → ~XXX (87% reduction)
- **Maintainability**: Single responsibility components
- **Testability**: All logic covered by 407 passing tests
- **Type safety**: Full TypeScript coverage maintained
- **Functionality**: Zero regressions, all features work

## Testing
✅ All 407 tests still passing
✅ TypeScript checks pass
✅ ESLint checks pass
✅ Manual testing complete (all wizard steps functional)

## Sprint 1 Complete
This completes Sprint 1 (Component Extraction + Integration).
Ready to proceed with Sprint 2 (Blockchain Integration).

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Success Criteria

Sprint 1b is complete when:
- ✅ page.tsx reduced from 2400 to ~200-300 lines
- ✅ All 407 tests still passing
- ✅ TypeScript and ESLint pass with zero errors
- ✅ Manual testing confirms all functionality works
- ✅ No duplicate code between page.tsx and extracted pieces
- ✅ Git commit created documenting the integration

---

## Rollback Plan

If integration fails at any point:
```bash
# Restore from backup
cp app/events/new/page.tsx.backup app/events/new/page.tsx
git checkout app/events/new/page.tsx

# Verify original still works
npm run dev
# Test manually

# Reset and try again
```

---

## Estimated Time Breakdown

- Phase 1 (Preparation): 15 minutes
- Phase 2 (Remove duplicates): 30 minutes
- Phase 3 (Replace state): 45 minutes
- Phase 4 (Replace functions): 45 minutes
- Phase 5 (Replace render functions): 90 minutes
- Phase 6 (Clean up): 30 minutes
- Phase 7 (Testing): 60 minutes
- Phase 8 (Commit): 15 minutes

**Total**: ~5.5 hours

---

## Notes

- Work incrementally - verify after each phase
- Run tests frequently to catch issues early
- Keep backup file until confident integration works
- Document any unexpected issues encountered
- Update this plan if approach changes
