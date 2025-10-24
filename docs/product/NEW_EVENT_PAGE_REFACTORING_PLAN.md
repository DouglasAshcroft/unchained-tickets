# NewEventPage Refactoring & Feature Integration Plan

**Status**: Approved for Implementation
**Created**: 2025-10-24
**Priority**: HIGH - Critical for hackathon completion
**Estimated Duration**: 8-12 days (1 developer full-time)

---

## Executive Summary

[app/events/new/page.tsx](../../app/events/new/page.tsx) is a 2400-line monolithic component that needs refactoring AND integration of missing blockchain/AI features. This plan covers both structural improvements and functional completions.

**Key Goals**:
1. ✅ Refactor 2400-line monolith into ~200-line orchestrator + focused components
2. ✅ Integrate blockchain event/tier registration (MISSING - breaks NFT minting)
3. ✅ Integrate AI poster generation via Stability.ai API (MISSING - only placeholders)
4. ✅ Add prompt customization and refinement UI (MISSING)
5. ✅ Add quality-of-life improvements (auto-save, validation, mobile UX)

---

## Decision Summary

**Refactoring Priority**: ✅ Refactor structure FIRST (cleaner, better maintainability)
**Draft Event Creation**: ✅ Create draft when entering "Posters" step (allows leaving and returning)
**Genesis Ticket**: ✅ Auto-create after blockchain registration
**Poster Storage**: ✅ NOW: base64 data URIs (simple) | LATER: Cloud storage (add to tech debt)
**AI Model**: ✅ Stability.ai Stable Diffusion XL ($0.002/image) - API key in .env

---

## Current State Analysis

### File Structure
- **2400 lines** - Single component file
- **16 useState hooks** - Complex form state management
- **5 wizard steps** - Basics, Schedule, Tickets, Posters, Review
- **Line 2** - TODO comment to break into components

### Critical Missing Features

#### 1. Blockchain Registration (Lines 456-459)
```typescript
onSuccess: (event) => {
  toast.success("Event created! You can keep editing anytime.");
  router.push(`/events/${event.id}`);
  // ❌ MISSING: No call to registerEventOnChain() or registerTiersOnChain()
}
```
**Impact**: Events exist in database but NOT on blockchain, breaking NFT minting.

#### 2. AI Poster Generation (Lines 1761-1793)
```typescript
const newVariants: PosterVariant[] = formData.ticketTypes.map((ticket) => ({
  ticketTypeId: ticket.id,
  ticketTypeName: ticket.name,
  imageUrl: `/assets/posters/placeholder-${selectedPosterStyle}.svg`, // ❌ PLACEHOLDER ONLY
  isApproved: false,
  rarityMultiplier,
}));
// ❌ MISSING: No API call to PosterGenerationService
```
**Impact**: No actual AI-generated posters, just hardcoded placeholders.

#### 3. Prompt Customization UI (Lines 1875-1923)
- Only style selection (vintage, modern, grunge, neon, minimalist, psychedelic)
- ❌ MISSING: No text input for custom prompt
- ❌ MISSING: No iteration/regeneration flow
- ❌ MISSING: No preview of prompts before generation

---

## Test-Driven Development (TDD) Approach

### Testing Philosophy

**Test Pyramid**:
- **70% Unit Tests** - Fast, isolated, comprehensive coverage
- **20% Integration Tests** - Component interactions, API flows
- **10% E2E Tests** - Critical user journeys

**Test-First Workflow**:
1. Write failing test
2. Implement minimal code to pass
3. Refactor with confidence
4. Repeat

### TDD Implementation Order

For each feature, we follow this cycle:
1. ✅ Write test specification
2. ✅ Write failing test
3. ✅ Implement feature (make test pass)
4. ✅ Refactor
5. ✅ Verify all tests still pass

---

## Phase 1: Component Refactoring (Structural)

**Goal**: 2400 lines → ~200 line orchestrator + focused components

### Test Specifications

#### 1.1 Custom Hooks Tests

**File**: `app/events/new/hooks/__tests__/useEventFormState.test.ts`

```typescript
describe('useEventFormState', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useEventFormState());
    expect(result.current.formData.title).toBe('');
    expect(result.current.formData.ticketTypes).toHaveLength(1);
  });

  it('should update field value', () => {
    const { result } = renderHook(() => useEventFormState());
    act(() => {
      result.current.updateField('title', 'Test Event');
    });
    expect(result.current.formData.title).toBe('Test Event');
  });

  it('should add ticket type', () => {
    const { result } = renderHook(() => useEventFormState());
    act(() => {
      result.current.addTicketType();
    });
    expect(result.current.formData.ticketTypes).toHaveLength(2);
  });

  it('should remove ticket type', () => {
    const { result } = renderHook(() => useEventFormState());
    const ticketId = result.current.formData.ticketTypes[0].id;

    act(() => {
      result.current.addTicketType();
      result.current.removeTicketType(ticketId);
    });

    expect(result.current.formData.ticketTypes).toHaveLength(1);
    expect(result.current.formData.ticketTypes[0].id).not.toBe(ticketId);
  });

  it('should not remove last ticket type', () => {
    const { result } = renderHook(() => useEventFormState());
    const ticketId = result.current.formData.ticketTypes[0].id;

    act(() => {
      result.current.removeTicketType(ticketId);
    });

    expect(result.current.formData.ticketTypes).toHaveLength(1);
  });

  it('should add perk to ticket', () => {
    const { result } = renderHook(() => useEventFormState());
    const ticketId = result.current.formData.ticketTypes[0].id;

    act(() => {
      result.current.addPerkToTicket(ticketId);
    });

    expect(result.current.formData.ticketTypes[0].perks).toHaveLength(1);
  });

  it('should update ticket field', () => {
    const { result } = renderHook(() => useEventFormState());
    const ticketId = result.current.formData.ticketTypes[0].id;

    act(() => {
      result.current.updateTicketField(ticketId, 'name', 'VIP Pass');
    });

    expect(result.current.formData.ticketTypes[0].name).toBe('VIP Pass');
  });
});
```

**File**: `app/events/new/hooks/__tests__/useEventValidation.test.ts`

```typescript
describe('useEventValidation', () => {
  describe('basics step', () => {
    it('should require event title', () => {
      const formData = { ...mockFormData, title: '' };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('basics');
      expect(errors.title).toBe('Event title is required.');
    });

    it('should validate poster URL format', () => {
      const formData = { ...mockFormData, posterImageUrl: 'not-a-url' };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('basics');
      expect(errors.posterImageUrl).toBe('Enter a valid URL for the poster image.');
    });

    it('should validate external link format', () => {
      const formData = { ...mockFormData, externalLink: 'invalid' };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('basics');
      expect(errors.externalLink).toBe('External link must be a valid URL.');
    });

    it('should pass with valid data', () => {
      const formData = {
        ...mockFormData,
        title: 'Test Event',
        posterImageUrl: '',
        externalLink: '',
      };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('basics');
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  describe('schedule step', () => {
    it('should require start date', () => {
      const formData = { ...mockFormData, startsAt: '' };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('schedule');
      expect(errors.startsAt).toBe('Start date/time is required.');
    });

    it('should require venue', () => {
      const formData = { ...mockFormData, venueId: '' };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('schedule');
      expect(errors.venueId).toBe('Select a venue to continue.');
    });

    it('should validate end time is after start time', () => {
      const formData = {
        ...mockFormData,
        startsAt: '2025-12-01T19:00',
        endsAt: '2025-12-01T18:00', // Before start
      };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('schedule');
      expect(errors.endsAt).toBe('End time must be after the start time.');
    });

    it('should require maps link', () => {
      const formData = { ...mockFormData, mapsLink: '' };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('schedule');
      expect(errors.mapsLink).toBe('Maps link is required for the venue.');
    });
  });

  describe('tickets step', () => {
    it('should require ticket name', () => {
      const formData = {
        ...mockFormData,
        ticketTypes: [{ ...mockTicketType, name: '' }],
      };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('tickets');
      expect(errors[`ticketTypes.${mockTicketType.id}.name`]).toBe('Ticket name is required.');
    });

    it('should enforce unique ticket names', () => {
      const formData = {
        ...mockFormData,
        ticketTypes: [
          { ...mockTicketType, id: '1', name: 'VIP' },
          { ...mockTicketType, id: '2', name: 'vip' }, // Duplicate (case-insensitive)
        ],
      };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('tickets');
      expect(errors['ticketTypes.2.name']).toBe('Ticket names must be unique.');
    });

    it('should require valid price', () => {
      const formData = {
        ...mockFormData,
        ticketTypes: [{ ...mockTicketType, price: 'abc' }],
      };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('tickets');
      expect(errors[`ticketTypes.${mockTicketType.id}.price`]).toBe('Price must be a valid non-negative number.');
    });

    it('should require capacity', () => {
      const formData = {
        ...mockFormData,
        ticketTypes: [{ ...mockTicketType, capacity: '' }],
      };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('tickets');
      expect(errors[`ticketTypes.${mockTicketType.id}.capacity`]).toBe('Capacity is required.');
    });

    it('should validate capacity is positive', () => {
      const formData = {
        ...mockFormData,
        ticketTypes: [{ ...mockTicketType, capacity: '-10' }],
      };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('tickets');
      expect(errors[`ticketTypes.${mockTicketType.id}.capacity`]).toBe('Capacity must be a positive whole number.');
    });

    it('should validate sales end is after sales start', () => {
      const formData = {
        ...mockFormData,
        ticketTypes: [{
          ...mockTicketType,
          salesStart: '2025-12-01T10:00',
          salesEnd: '2025-12-01T09:00', // Before start
        }],
      };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('tickets');
      expect(errors[`ticketTypes.${mockTicketType.id}.salesEnd`]).toBe('Sales end must be after the start.');
    });
  });

  describe('posters step', () => {
    it('should require all tiers to have approved posters', () => {
      const formData = {
        ...mockFormData,
        ticketTypes: [
          { ...mockTicketType, id: '1', name: 'VIP' },
          { ...mockTicketType, id: '2', name: 'GA' },
        ],
        posterVariants: [
          { ticketTypeId: '1', isApproved: true, imageUrl: 'url1', ticketTypeName: 'VIP', rarityMultiplier: 2.0 },
          { ticketTypeId: '2', isApproved: false, imageUrl: 'url2', ticketTypeName: 'GA', rarityMultiplier: 1.0 },
        ],
      };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('posters');
      expect(errors.posters).toContain('Missing: GA');
    });

    it('should pass when all tiers have approved posters', () => {
      const formData = {
        ...mockFormData,
        ticketTypes: [
          { ...mockTicketType, id: '1', name: 'VIP' },
        ],
        posterVariants: [
          { ticketTypeId: '1', isApproved: true, imageUrl: 'url1', ticketTypeName: 'VIP', rarityMultiplier: 2.0 },
        ],
      };
      const { result } = renderHook(() => useEventValidation(formData));

      const errors = result.current.validateStep('posters');
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });
});
```

**File**: `app/events/new/hooks/__tests__/useWizardNavigation.test.ts`

```typescript
describe('useWizardNavigation', () => {
  const mockValidation = {
    validateStep: jest.fn(),
    clearErrors: jest.fn(),
    errors: {},
  };

  it('should initialize at step 0', () => {
    const { result } = renderHook(() => useWizardNavigation(mockValidation));
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.currentStep.id).toBe('basics');
  });

  it('should navigate to next step when validation passes', () => {
    mockValidation.validateStep.mockReturnValue({});
    const { result } = renderHook(() => useWizardNavigation(mockValidation));

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentStepIndex).toBe(1);
  });

  it('should not navigate when validation fails', () => {
    mockValidation.validateStep.mockReturnValue({ title: 'Required' });
    const { result } = renderHook(() => useWizardNavigation(mockValidation));

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentStepIndex).toBe(0);
  });

  it('should navigate back', () => {
    const { result } = renderHook(() => useWizardNavigation(mockValidation));

    act(() => {
      result.current.goToStep(2);
      result.current.handleBack();
    });

    expect(result.current.currentStepIndex).toBe(1);
  });

  it('should not navigate back from first step', () => {
    const { result } = renderHook(() => useWizardNavigation(mockValidation));

    act(() => {
      result.current.handleBack();
    });

    expect(result.current.currentStepIndex).toBe(0);
  });

  it('should jump to specific step', () => {
    const { result } = renderHook(() => useWizardNavigation(mockValidation));

    act(() => {
      result.current.goToStep(3);
    });

    expect(result.current.currentStepIndex).toBe(3);
    expect(result.current.currentStep.id).toBe('posters');
  });

  it('should not allow out-of-bounds step', () => {
    const { result } = renderHook(() => useWizardNavigation(mockValidation));

    act(() => {
      result.current.goToStep(99);
    });

    expect(result.current.currentStepIndex).toBe(0);
  });
});
```

#### 1.2 Form Components Tests

**File**: `app/events/new/components/form/__tests__/ArtistSearchInput.test.tsx`

```typescript
describe('ArtistSearchInput', () => {
  const mockArtists = [
    { id: 1, name: 'Taylor Swift', slug: 'taylor-swift', genre: 'Pop' },
    { id: 2, name: 'The Beatles', slug: 'the-beatles', genre: 'Rock' },
  ];

  it('should render input field', () => {
    render(<ArtistSearchInput value="" onChange={jest.fn()} onSelect={jest.fn()} artists={mockArtists} />);
    expect(screen.getByPlaceholderText(/search by artist name/i)).toBeInTheDocument();
  });

  it('should show suggestions on focus', async () => {
    render(<ArtistSearchInput value="" onChange={jest.fn()} onSelect={jest.fn()} artists={mockArtists} />);

    const input = screen.getByPlaceholderText(/search by artist name/i);
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      expect(screen.getByText('The Beatles')).toBeInTheDocument();
    });
  });

  it('should filter suggestions based on input', async () => {
    const handleChange = jest.fn();
    render(<ArtistSearchInput value="taylor" onChange={handleChange} onSelect={jest.fn()} artists={mockArtists} />);

    const input = screen.getByPlaceholderText(/search by artist name/i);
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
      expect(screen.queryByText('The Beatles')).not.toBeInTheDocument();
    });
  });

  it('should call onSelect when artist is clicked', async () => {
    const handleSelect = jest.fn();
    render(<ArtistSearchInput value="" onChange={jest.fn()} onSelect={handleSelect} artists={mockArtists} />);

    const input = screen.getByPlaceholderText(/search by artist name/i);
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByText('Taylor Swift'));

    expect(handleSelect).toHaveBeenCalledWith(mockArtists[0]);
  });

  it('should display error message', () => {
    render(<ArtistSearchInput value="" onChange={jest.fn()} onSelect={jest.fn()} artists={mockArtists} error="Artist is required" />);
    expect(screen.getByText('Artist is required')).toBeInTheDocument();
  });
});
```

**File**: `app/events/new/components/form/__tests__/TicketTypeCard.test.tsx`

```typescript
describe('TicketTypeCard', () => {
  const mockTicket = {
    id: 'ticket-1',
    name: 'VIP Pass',
    description: 'Premium access',
    pricingType: 'general_admission' as const,
    price: '99.99',
    currency: 'USD',
    capacity: '100',
    salesStart: '',
    salesEnd: '',
    isActive: true,
    perks: [],
  };

  const mockHandlers = {
    onFieldChange: jest.fn(),
    onRemove: jest.fn(),
    onAddPerk: jest.fn(),
    onRemovePerk: jest.fn(),
    onPerkChange: jest.fn(),
  };

  it('should render ticket fields', () => {
    render(<TicketTypeCard ticket={mockTicket} index={0} errors={{}} handlers={mockHandlers} />);

    expect(screen.getByDisplayValue('VIP Pass')).toBeInTheDocument();
    expect(screen.getByDisplayValue('99.99')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  it('should call onFieldChange when name is updated', () => {
    render(<TicketTypeCard ticket={mockTicket} index={0} errors={{}} handlers={mockHandlers} />);

    const nameInput = screen.getByDisplayValue('VIP Pass');
    fireEvent.change(nameInput, { target: { value: 'Super VIP' } });

    expect(mockHandlers.onFieldChange).toHaveBeenCalledWith('ticket-1', 'name', 'Super VIP');
  });

  it('should display field errors', () => {
    const errors = {
      'ticketTypes.ticket-1.name': 'Name is required',
      'ticketTypes.ticket-1.price': 'Invalid price',
    };

    render(<TicketTypeCard ticket={mockTicket} index={0} errors={errors} handlers={mockHandlers} />);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Invalid price')).toBeInTheDocument();
  });

  it('should add perk when button clicked', () => {
    render(<TicketTypeCard ticket={mockTicket} index={0} errors={{}} handlers={mockHandlers} />);

    const addPerkButton = screen.getByText(/add perk/i);
    fireEvent.click(addPerkButton);

    expect(mockHandlers.onAddPerk).toHaveBeenCalledWith('ticket-1');
  });

  it('should display perks', () => {
    const ticketWithPerks = {
      ...mockTicket,
      perks: [
        { id: 'perk-1', name: 'Free Drink', description: 'One complimentary beverage', instructions: 'Redeem at bar', quantity: '1' },
      ],
    };

    render(<TicketTypeCard ticket={ticketWithPerks} index={0} errors={{}} handlers={mockHandlers} />);

    expect(screen.getByDisplayValue('Free Drink')).toBeInTheDocument();
  });

  it('should call onRemove when remove button clicked', () => {
    render(<TicketTypeCard ticket={mockTicket} index={0} errors={{}} handlers={mockHandlers} />);

    const removeButton = screen.getByText(/remove/i);
    fireEvent.click(removeButton);

    expect(mockHandlers.onRemove).toHaveBeenCalledWith('ticket-1');
  });
});
```

#### 1.3 Step Components Tests

**File**: `app/events/new/components/steps/__tests__/BasicsStep.test.tsx`

```typescript
describe('BasicsStep', () => {
  const mockProps = {
    formData: {
      title: '',
      posterImageUrl: '',
      externalLink: '',
      primaryArtistId: '',
    },
    errors: {},
    artists: [
      { id: 1, name: 'Artist One', slug: 'artist-one', genre: 'Rock' },
    ],
    selectedArtist: null,
    posterFile: null,
    posterPreview: null,
    handlers: {
      onFieldChange: jest.fn(),
      onArtistSelect: jest.fn(),
      onPosterFileChange: jest.fn(),
      onPosterDrop: jest.fn(),
      onClearPoster: jest.fn(),
    },
  };

  it('should render all fields', () => {
    render(<BasicsStep {...mockProps} />);

    expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/primary artist/i)).toBeInTheDocument();
    expect(screen.getByText(/poster image file/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/poster image url/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/external event link/i)).toBeInTheDocument();
  });

  it('should call onFieldChange when title is updated', () => {
    render(<BasicsStep {...mockProps} />);

    const titleInput = screen.getByLabelText(/event title/i);
    fireEvent.change(titleInput, { target: { value: 'My Concert' } });

    expect(mockProps.handlers.onFieldChange).toHaveBeenCalledWith('title', 'My Concert');
  });

  it('should display validation errors', () => {
    const propsWithErrors = {
      ...mockProps,
      errors: {
        title: 'Title is required',
        posterImageUrl: 'Invalid URL',
      },
    };

    render(<BasicsStep {...propsWithErrors} />);

    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Invalid URL')).toBeInTheDocument();
  });

  it('should show poster preview when file is uploaded', () => {
    const propsWithPoster = {
      ...mockProps,
      posterPreview: 'data:image/png;base64,iVBORw0KGgo=',
      posterFile: new File([''], 'poster.png', { type: 'image/png' }),
    };

    render(<BasicsStep {...propsWithPoster} />);

    expect(screen.getByAltText(/poster preview/i)).toBeInTheDocument();
  });
});
```

#### 1.4 Integration Tests

**File**: `app/events/new/__tests__/NewEventPage.integration.test.tsx`

```typescript
describe('NewEventPage Integration', () => {
  beforeEach(() => {
    // Mock API calls
    server.use(
      rest.get('/api/venues', (req, res, ctx) => {
        return res(ctx.json(mockVenues));
      }),
      rest.get('/api/artists', (req, res, ctx) => {
        return res(ctx.json(mockArtists));
      })
    );
  });

  it('should complete full wizard flow', async () => {
    render(<NewEventPage />);

    // Step 1: Basics
    expect(screen.getByText(/step 1/i)).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/event title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Concert' } });

    // Select artist
    const artistInput = screen.getByPlaceholderText(/search by artist/i);
    fireEvent.focus(artistInput);
    await waitFor(() => {
      expect(screen.getByText('Taylor Swift')).toBeInTheDocument();
    });
    fireEvent.mouseDown(screen.getByText('Taylor Swift'));

    fireEvent.click(screen.getByText(/next/i));

    // Step 2: Schedule
    await waitFor(() => {
      expect(screen.getByText(/step 2/i)).toBeInTheDocument();
    });

    const startInput = screen.getByLabelText(/start time/i);
    fireEvent.change(startInput, { target: { value: '2025-12-01T19:00' } });

    // Select venue
    const venueInput = screen.getByPlaceholderText(/search by venue/i);
    fireEvent.focus(venueInput);
    await waitFor(() => {
      expect(screen.getByText('Test Venue')).toBeInTheDocument();
    });
    fireEvent.mouseDown(screen.getByText('Test Venue'));

    fireEvent.click(screen.getByText(/next/i));

    // Step 3: Tickets
    await waitFor(() => {
      expect(screen.getByText(/step 3/i)).toBeInTheDocument();
    });

    const ticketNameInput = screen.getByPlaceholderText(/general admission/i);
    fireEvent.change(ticketNameInput, { target: { value: 'VIP Pass' } });

    const priceInput = screen.getByLabelText(/price/i);
    fireEvent.change(priceInput, { target: { value: '99.99' } });

    const capacityInput = screen.getByLabelText(/capacity/i);
    fireEvent.change(capacityInput, { target: { value: '100' } });

    fireEvent.click(screen.getByText(/next/i));

    // Step 4: Posters
    await waitFor(() => {
      expect(screen.getByText(/step 4/i)).toBeInTheDocument();
    });

    // For now, skip poster generation (tested separately)
    fireEvent.click(screen.getByText(/next/i));

    // Step 5: Review
    await waitFor(() => {
      expect(screen.getByText(/step 5/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Test Concert')).toBeInTheDocument();
    expect(screen.getByText('VIP Pass')).toBeInTheDocument();
  });

  it('should prevent navigation when validation fails', async () => {
    render(<NewEventPage />);

    // Try to proceed without filling required fields
    fireEvent.click(screen.getByText(/next/i));

    // Should show error and stay on step 1
    await waitFor(() => {
      expect(screen.getByText(/event title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/step 1/i)).toBeInTheDocument();
    });
  });

  it('should allow navigation back', async () => {
    render(<NewEventPage />);

    // Fill basics and go to step 2
    const titleInput = screen.getByLabelText(/event title/i);
    fireEvent.change(titleInput, { target: { value: 'Test' } });
    fireEvent.click(screen.getByText(/next/i));

    await waitFor(() => {
      expect(screen.getByText(/step 2/i)).toBeInTheDocument();
    });

    // Go back
    fireEvent.click(screen.getByText(/back/i));

    await waitFor(() => {
      expect(screen.getByText(/step 1/i)).toBeInTheDocument();
    });
  });
});
```

---

## Phase 2: Blockchain Registration Integration

**Goal**: Events registered on blockchain immediately after creation

### Test Specifications

#### 2.1 API Client Tests

**File**: `lib/api/__tests__/client.blockchain.test.ts`

```typescript
describe('API Client - Blockchain Methods', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('registerEventOnChain', () => {
    it('should call POST /api/events/:id/register-on-chain', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({
        success: true,
        onChainEventId: 123,
        txHash: '0xabc123',
      }));

      const result = await api.registerEventOnChain(123);

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/events/123/register-on-chain',
        expect.objectContaining({ method: 'POST' })
      );

      expect(result.success).toBe(true);
      expect(result.onChainEventId).toBe(123);
      expect(result.txHash).toBe('0xabc123');
    });

    it('should handle registration errors', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({
        success: false,
        error: 'Contract call failed',
      }));

      const result = await api.registerEventOnChain(123);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Contract call failed');
    });
  });

  describe('registerTiersOnChain', () => {
    it('should call POST /api/events/:id/register-tiers', async () => {
      fetchMock.mockResponseOnce(JSON.stringify([
        { success: true, tierName: 'VIP', onChainTierId: 0, txHash: '0xdef456' },
        { success: true, tierName: 'GA', onChainTierId: 1, txHash: '0xghi789' },
      ]));

      const results = await api.registerTiersOnChain(123);

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/events/123/register-tiers',
        expect.objectContaining({ method: 'POST' })
      );

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].tierName).toBe('VIP');
    });
  });
});
```

#### 2.2 API Route Tests

**File**: `app/api/events/[id]/register-on-chain/__tests__/route.test.ts`

```typescript
describe('POST /api/events/:id/register-on-chain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register event on blockchain', async () => {
    // Mock registerEventOnChain service
    jest.spyOn(OnChainEventService, 'registerEventOnChain').mockResolvedValue({
      success: true,
      onChainEventId: 123,
      txHash: '0xabc123',
    });

    const request = new Request('http://localhost/api/events/123/register-on-chain', {
      method: 'POST',
    });

    const response = await POST(request, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();

    expect(OnChainEventService.registerEventOnChain).toHaveBeenCalledWith(123);
    expect(data.success).toBe(true);
    expect(data.onChainEventId).toBe(123);
  });

  it('should handle registration failure', async () => {
    jest.spyOn(OnChainEventService, 'registerEventOnChain').mockResolvedValue({
      success: false,
      error: 'Event already registered',
    });

    const request = new Request('http://localhost/api/events/123/register-on-chain', {
      method: 'POST',
    });

    const response = await POST(request, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();

    expect(data.success).toBe(false);
    expect(data.error).toBe('Event already registered');
  });

  it('should handle service errors', async () => {
    jest.spyOn(OnChainEventService, 'registerEventOnChain').mockRejectedValue(
      new Error('RPC connection failed')
    );

    const request = new Request('http://localhost/api/events/123/register-on-chain', {
      method: 'POST',
    });

    const response = await POST(request, { params: Promise.resolve({ id: '123' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('RPC connection failed');
  });
});
```

#### 2.3 Integration Test

**File**: `app/events/new/__tests__/blockchain-registration.test.tsx`

```typescript
describe('Blockchain Registration Integration', () => {
  beforeEach(() => {
    server.use(
      rest.post('/api/events', (req, res, ctx) => {
        return res(ctx.json({ id: 123, title: 'Test Event' }));
      }),
      rest.post('/api/events/123/register-on-chain', (req, res, ctx) => {
        return res(ctx.json({
          success: true,
          onChainEventId: 123,
          txHash: '0xabc123',
        }));
      }),
      rest.post('/api/events/123/register-tiers', (req, res, ctx) => {
        return res(ctx.json([
          { success: true, tierName: 'VIP', onChainTierId: 0, txHash: '0xdef456' },
        ]));
      })
    );
  });

  it('should register event on blockchain after creation', async () => {
    render(<NewEventPage />);

    // Complete wizard and create event
    await fillBasicsStep();
    await fillScheduleStep();
    await fillTicketsStep();
    await skipPostersStep();
    await submitEvent();

    // Verify blockchain registration toast
    await waitFor(() => {
      expect(screen.getByText(/registering event on blockchain/i)).toBeInTheDocument();
    });

    // Verify success toast with transaction hash
    await waitFor(() => {
      expect(screen.getByText(/event registered/i)).toBeInTheDocument();
      expect(screen.getByText(/0xabc123/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify tier registration toast
    await waitFor(() => {
      expect(screen.getByText(/1\/1 tiers registered/i)).toBeInTheDocument();
    });
  });

  it('should handle blockchain registration failure gracefully', async () => {
    server.use(
      rest.post('/api/events/123/register-on-chain', (req, res, ctx) => {
        return res(ctx.json({
          success: false,
          error: 'Gas estimation failed',
        }));
      })
    );

    render(<NewEventPage />);

    await completeWizardAndSubmit();

    // Verify error toast
    await waitFor(() => {
      expect(screen.getByText(/blockchain registration failed/i)).toBeInTheDocument();
    });

    // Verify navigation still works (event saved as draft)
    await waitFor(() => {
      expect(window.location.pathname).toBe('/events/123');
    });
  });

  it('should auto-create Genesis ticket after successful registration', async () => {
    const mockConfirm = jest.spyOn(window, 'confirm').mockReturnValue(true);

    server.use(
      rest.post('/api/genesis-tickets', (req, res, ctx) => {
        return res(ctx.json({ success: true, ticketId: 456 }));
      })
    );

    render(<NewEventPage />);

    await completeWizardAndSubmit();

    // Wait for registration to complete
    await waitFor(() => {
      expect(screen.getByText(/1\/1 tiers registered/i)).toBeInTheDocument();
    });

    // Verify Genesis ticket prompt
    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining('Genesis Archive ticket')
    );

    // Verify Genesis creation toast
    await waitFor(() => {
      expect(screen.getByText(/genesis ticket created/i)).toBeInTheDocument();
    });

    mockConfirm.mockRestore();
  });
});
```

---

## Phase 3: AI Poster Generation Integration

**Goal**: Replace placeholders with real AI-generated posters using Stability.ai

### Test Specifications

#### 3.1 Service Tests

**File**: `lib/services/__tests__/PosterGenerationService.test.ts`

```typescript
describe('PosterGenerationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.resetMocks();
  });

  describe('buildPromptFromEvent', () => {
    it('should build prompt with event details', async () => {
      const event = {
        id: 1,
        title: 'Summer Concert',
        artists: [
          { artist: { name: 'Taylor Swift', genre: 'Pop' } },
        ],
      };

      const ticketType = {
        id: 1,
        name: 'VIP',
      };

      const prompt = await buildPromptFromEvent(event, ticketType, 'vintage', '');

      expect(prompt).toContain('vintage 1960s psychedelic concert poster');
      expect(prompt).toContain('Taylor Swift');
      expect(prompt).toContain('Pop music event');
      expect(prompt).toContain('rich gold and silver accents'); // VIP tier
    });

    it('should include custom prompt', async () => {
      const event = mockEvent;
      const ticketType = mockTicketType;

      const prompt = await buildPromptFromEvent(
        event,
        ticketType,
        'modern',
        'include band logo in corner'
      );

      expect(prompt).toContain('include band logo in corner');
    });

    it('should apply tier-specific enhancements', async () => {
      const event = mockEvent;
      const gaTicket = { id: 1, name: 'General Admission' };
      const vipTicket = { id: 2, name: 'VIP Pass' };

      const gaPrompt = await buildPromptFromEvent(event, gaTicket, 'modern', '');
      const vipPrompt = await buildPromptFromEvent(event, vipTicket, 'modern', '');

      expect(gaPrompt).toContain('vibrant standard color palette');
      expect(vipPrompt).toContain('rich gold and silver accents');
      expect(vipPrompt).toContain('metallic sheen');
    });
  });

  describe('generatePosterVariants', () => {
    beforeEach(() => {
      // Mock Stability.ai API
      fetchMock.mockResponseOnce(JSON.stringify({
        artifacts: [
          { base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' }
        ]
      }));
    });

    it('should generate posters for all ticket types', async () => {
      const result = await generatePosterVariants({
        eventId: 1,
        venueId: 1,
        ticketTypeIds: [1, 2],
        style: 'vintage',
      });

      expect(result.success).toBe(true);
      expect(result.variants).toHaveLength(2);
      expect(result.variants[0].imageUrl).toContain('data:image/png;base64');
    });

    it('should handle missing API key', async () => {
      delete process.env.STABILITY_API_KEY;

      const result = await generatePosterVariants({
        eventId: 1,
        venueId: 1,
        ticketTypeIds: [1],
        style: 'modern',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not configured');
    });

    it('should create database records for generation requests', async () => {
      const prismaSpy = jest.spyOn(prisma.posterGenerationRequest, 'create');

      await generatePosterVariants({
        eventId: 1,
        venueId: 1,
        ticketTypeIds: [1],
        style: 'grunge',
      });

      expect(prismaSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            eventId: 1,
            provider: 'stability-ai',
            status: 'pending',
          }),
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      fetchMock.mockRejectOnce(new Error('API rate limit exceeded'));

      const result = await generatePosterVariants({
        eventId: 1,
        venueId: 1,
        ticketTypeIds: [1],
        style: 'neon',
      });

      // Should fall back to placeholder
      expect(result.success).toBe(true);
      expect(result.variants[0].imageUrl).toContain('data:image/svg+xml');
    });
  });

  describe('refineGeneration', () => {
    it('should create new variant with refined prompt', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({
        artifacts: [{ base64: 'newImageBase64' }]
      }));

      const result = await refineGeneration(1, 'make it more colorful, add sunset');

      expect(result.success).toBe(true);
      expect(result.variants[0].variantName).toContain('Refined');
    });
  });
});
```

#### 3.2 API Route Tests

**File**: `app/api/posters/generate/__tests__/route.test.ts`

```typescript
describe('POST /api/posters/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate posters for ticket types', async () => {
    jest.spyOn(PosterGenerationService, 'generatePosterVariants').mockResolvedValue({
      success: true,
      variants: [
        { ticketTypeId: 1, variantName: 'VIP - Vintage', imageUrl: 'data:image/png;base64,abc', rarityMultiplier: 2.0 },
      ],
    });

    const request = new Request('http://localhost/api/posters/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: 1,
        venueId: 1,
        ticketTypeIds: [1],
        style: 'vintage',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(PosterGenerationService.generatePosterVariants).toHaveBeenCalledWith({
      eventId: 1,
      venueId: 1,
      ticketTypeIds: [1],
      style: 'vintage',
      customPrompt: undefined,
    });

    expect(data.success).toBe(true);
    expect(data.variants).toHaveLength(1);
  });

  it('should validate required fields', async () => {
    const request = new Request('http://localhost/api/posters/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Missing eventId
        style: 'vintage',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Missing required fields');
  });

  it('should pass custom prompt to service', async () => {
    const generateSpy = jest.spyOn(PosterGenerationService, 'generatePosterVariants').mockResolvedValue({
      success: true,
      variants: [],
    });

    const request = new Request('http://localhost/api/posters/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: 1,
        venueId: 1,
        ticketTypeIds: [1],
        style: 'modern',
        customPrompt: 'include stage lighting effects',
      }),
    });

    await POST(request);

    expect(generateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        customPrompt: 'include stage lighting effects',
      })
    );
  });
});
```

#### 3.3 Component Integration Tests

**File**: `app/events/new/components/steps/__tests__/PostersStep.integration.test.tsx`

```typescript
describe('PostersStep - AI Generation Integration', () => {
  beforeEach(() => {
    server.use(
      rest.post('/api/posters/generate', (req, res, ctx) => {
        return res(
          ctx.delay(1000), // Simulate generation delay
          ctx.json({
            success: true,
            variants: [
              {
                ticketTypeId: 'ticket-1',
                variantName: 'VIP - Vintage',
                imageUrl: 'data:image/png;base64,generatedImage',
                rarityMultiplier: 2.0,
              },
            ],
          })
        );
      })
    );
  });

  it('should generate posters when style is selected and button clicked', async () => {
    const mockHandlers = {
      onGenerate: jest.fn(),
      onApprove: jest.fn(),
      onRefine: jest.fn(),
    };

    render(
      <PostersStep
        formData={{
          eventId: 1,
          ticketTypes: [{ id: 'ticket-1', name: 'VIP' }],
          posterVariants: [],
        }}
        posterVariants={[]}
        handlers={mockHandlers}
      />
    );

    // Select style
    const vintageButton = screen.getByText(/vintage concert poster/i);
    fireEvent.click(vintageButton);

    // Click generate
    const generateButton = screen.getByText(/generate 1 poster/i);
    fireEvent.click(generateButton);

    // Verify loading state
    expect(screen.getByText(/generating posters/i)).toBeInTheDocument();

    // Wait for generation to complete
    await waitFor(() => {
      expect(screen.getByText(/poster preview/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify variant displayed
    expect(screen.getByText('VIP - Vintage')).toBeInTheDocument();
  });

  it('should show error if generation fails', async () => {
    server.use(
      rest.post('/api/posters/generate', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ success: false, error: 'API rate limit exceeded' })
        );
      })
    );

    render(<PostersStep {...mockProps} />);

    // Select style and generate
    fireEvent.click(screen.getByText(/vintage/i));
    fireEvent.click(screen.getByText(/generate/i));

    // Verify error toast
    await waitFor(() => {
      expect(screen.getByText(/api rate limit exceeded/i)).toBeInTheDocument();
    });
  });

  it('should create draft event before generation if needed', async () => {
    const createDraftSpy = jest.fn().mockResolvedValue({ id: 123 });

    render(
      <PostersStep
        formData={{
          eventId: null, // No event ID yet
          title: 'Test Event',
          startsAt: '2025-12-01T19:00',
          venueId: '1',
          ticketTypes: [{ id: 'ticket-1', name: 'VIP' }],
          posterVariants: [],
        }}
        onCreateDraft={createDraftSpy}
        {...otherProps}
      />
    );

    // Attempt to generate
    fireEvent.click(screen.getByText(/vintage/i));
    fireEvent.click(screen.getByText(/generate/i));

    // Verify draft creation called
    await waitFor(() => {
      expect(createDraftSpy).toHaveBeenCalled();
    });
  });
});
```

---

## Phase 4: Prompt Customization UI

**Goal**: Allow users to customize AI prompts and iterate on generations

### Test Specifications

#### 4.1 Component Tests

**File**: `app/events/new/components/__tests__/PosterRefinementDialog.test.tsx`

```typescript
describe('PosterRefinementDialog', () => {
  const mockVariant = {
    ticketTypeId: 'ticket-1',
    ticketTypeName: 'VIP Pass',
    imageUrl: 'data:image/png;base64,original',
    isApproved: false,
    rarityMultiplier: 2.0,
  };

  const mockHandlers = {
    onRefine: jest.fn(),
    onClose: jest.fn(),
  };

  it('should render when open', () => {
    render(
      <PosterRefinementDialog
        isOpen={true}
        variant={mockVariant}
        {...mockHandlers}
      />
    );

    expect(screen.getByText(/refine vip pass poster/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/refinement instructions/i)).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <PosterRefinementDialog
        isOpen={false}
        variant={mockVariant}
        {...mockHandlers}
      />
    );

    expect(screen.queryByText(/refine vip pass/i)).not.toBeInTheDocument();
  });

  it('should call onRefine with new prompt', async () => {
    render(
      <PosterRefinementDialog
        isOpen={true}
        variant={mockVariant}
        {...mockHandlers}
      />
    );

    const textarea = screen.getByLabelText(/refinement instructions/i);
    fireEvent.change(textarea, { target: { value: 'add more neon colors' } });

    const generateButton = screen.getByText(/generate new version/i);
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockHandlers.onRefine).toHaveBeenCalledWith('ticket-1', 'add more neon colors');
    });
  });

  it('should disable generate button when prompt is empty', () => {
    render(
      <PosterRefinementDialog
        isOpen={true}
        variant={mockVariant}
        {...mockHandlers}
      />
    );

    const generateButton = screen.getByText(/generate new version/i);
    expect(generateButton).toBeDisabled();
  });

  it('should show loading state during refinement', async () => {
    mockHandlers.onRefine.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(
      <PosterRefinementDialog
        isOpen={true}
        variant={mockVariant}
        {...mockHandlers}
      />
    );

    const textarea = screen.getByLabelText(/refinement instructions/i);
    fireEvent.change(textarea, { target: { value: 'test' } });

    const generateButton = screen.getByText(/generate new version/i);
    fireEvent.click(generateButton);

    expect(screen.getByText(/generating.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockHandlers.onRefine).toHaveBeenCalled();
    });
  });

  it('should close dialog on cancel', () => {
    render(
      <PosterRefinementDialog
        isOpen={true}
        variant={mockVariant}
        {...mockHandlers}
      />
    );

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(mockHandlers.onClose).toHaveBeenCalled();
  });
});
```

#### 4.2 Refinement Flow Tests

**File**: `app/api/posters/refine/__tests__/route.test.ts`

```typescript
describe('POST /api/posters/refine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should refine poster with new prompt', async () => {
    jest.spyOn(PosterGenerationService, 'refineGeneration').mockResolvedValue({
      success: true,
      variants: [
        {
          ticketTypeId: 1,
          variantName: 'VIP - Refined',
          imageUrl: 'data:image/png;base64,refined',
          rarityMultiplier: 2.0,
        },
      ],
    });

    const request = new Request('http://localhost/api/posters/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: 1,
        ticketTypeId: 1,
        refinementPrompt: 'add sunset colors',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.variants[0].imageUrl).toContain('refined');
  });

  it('should return error if original generation not found', async () => {
    jest.spyOn(prisma.posterGenerationRequest, 'findFirst').mockResolvedValue(null);

    const request = new Request('http://localhost/api/posters/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId: 999,
        ticketTypeId: 1,
        refinementPrompt: 'test',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('Original generation not found');
  });
});
```

#### 4.3 E2E Tests

**File**: `e2e/poster-refinement.spec.ts`

```typescript
test.describe('Poster Refinement Flow', () => {
  test('user can refine generated poster', async ({ page }) => {
    await page.goto('/events/new');

    // Complete wizard to posters step
    await fillEventBasics(page);
    await fillSchedule(page);
    await fillTickets(page);

    // Generate posters
    await page.click('text=Vintage Concert Poster');
    await page.click('text=Generate 1 Poster');

    // Wait for generation
    await page.waitForSelector('text=Approve Poster', { timeout: 60000 });

    // Click refine
    await page.click('text=Refine');

    // Enter refinement prompt
    await page.fill('textarea[placeholder*="what you\'d like to change"]', 'add more blue colors and sunset gradient');

    // Generate refined version
    await page.click('text=Generate New Version');

    // Wait for refined poster
    await page.waitForSelector('text=Poster refined', { timeout: 60000 });

    // Verify new poster displayed
    await expect(page.locator('img[alt*="Poster preview"]')).toBeVisible();
  });

  test('user can iterate multiple times', async ({ page }) => {
    await navigateToPostersStep(page);
    await generateInitialPosters(page);

    // First refinement
    await refineWithPrompt(page, 'make it darker');
    await page.waitForSelector('text=Poster refined');

    // Second refinement
    await page.click('text=Refine');
    await refineWithPrompt(page, 'add neon accents');
    await page.waitForSelector('text=Poster refined');

    // Verify multiple variants in history
    const variants = await page.locator('[data-testid="poster-variant"]').count();
    expect(variants).toBeGreaterThanOrEqual(2);
  });
});
```

---

## Phase 5: Additional Improvements

### Test Specifications

#### 5.1 Auto-Save Tests

**File**: `app/events/new/__tests__/auto-save.test.tsx`

```typescript
describe('Auto-Save Draft', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    server.use(
      rest.post('/api/events', (req, res, ctx) => {
        return res(ctx.json({ id: 123, title: 'Draft Event' }));
      }),
      rest.put('/api/events/123', (req, res, ctx) => {
        return res(ctx.json({ id: 123, title: 'Updated Draft' }));
      })
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should auto-save draft every 30 seconds', async () => {
    const createSpy = jest.fn();
    const updateSpy = jest.fn();

    render(<NewEventPage />);

    // Fill minimum required fields
    const titleInput = screen.getByLabelText(/event title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Event' } });

    // Advance 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Verify create called
    await waitFor(() => {
      expect(createSpy).toHaveBeenCalled();
    });

    // Make another change
    fireEvent.change(titleInput, { target: { value: 'Updated Event' } });

    // Advance 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Verify update called
    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  it('should not auto-save with insufficient data', () => {
    const createSpy = jest.fn();

    render(<NewEventPage />);

    // Don't fill any fields

    // Advance 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Verify no save attempt
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('should show last saved timestamp', async () => {
    render(<NewEventPage />);

    // Fill fields and trigger save
    await fillMinimumRequiredFields();

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Verify timestamp shown
    await waitFor(() => {
      expect(screen.getByText(/last saved:/i)).toBeInTheDocument();
    });
  });
});
```

#### 5.2 Capacity Validation Tests

**File**: `app/events/new/components/steps/__tests__/TicketsStep.capacity.test.tsx`

```typescript
describe('Capacity Validation', () => {
  const mockVenue = {
    id: 1,
    name: 'Test Venue',
    capacity: 500, // Fixed venue capacity
  };

  it('should show warning when total capacity exceeds venue capacity', () => {
    render(
      <TicketsStep
        selectedVenue={mockVenue}
        ticketTypes={[
          { ...mockTicketType, capacity: '300' },
          { ...mockTicketType, capacity: '300' }, // Total: 600 > 500
        ]}
        {...otherProps}
      />
    );

    expect(screen.getByText(/total ticket capacity exceeds venue capacity/i)).toBeInTheDocument();
    expect(screen.getByText(/may violate fire marshal regulations/i)).toBeInTheDocument();
  });

  it('should not show warning when within capacity', () => {
    render(
      <TicketsStep
        selectedVenue={mockVenue}
        ticketTypes={[
          { ...mockTicketType, capacity: '200' },
          { ...mockTicketType, capacity: '200' }, // Total: 400 <= 500
        ]}
        {...otherProps}
      />
    );

    expect(screen.queryByText(/exceeds venue capacity/i)).not.toBeInTheDocument();
  });

  it('should calculate total capacity correctly', () => {
    render(
      <TicketsStep
        selectedVenue={mockVenue}
        ticketTypes={[
          { ...mockTicketType, capacity: '150' },
          { ...mockTicketType, capacity: '100' },
          { ...mockTicketType, capacity: '50' },
        ]}
        {...otherProps}
      />
    );

    expect(screen.getByText(/total capacity: 300 \/ 500/i)).toBeInTheDocument();
  });
});
```

#### 5.3 Keyboard Navigation Tests

**File**: `app/events/new/__tests__/keyboard-navigation.test.tsx`

```typescript
describe('Keyboard Navigation', () => {
  it('should navigate forward with right arrow', () => {
    render(<NewEventPage />);

    // Complete step 1
    fillBasicsStep();

    // Press right arrow
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    expect(screen.getByText(/step 2/i)).toBeInTheDocument();
  });

  it('should navigate back with left arrow', () => {
    render(<NewEventPage />);

    // Go to step 2
    fillBasicsStep();
    clickNext();

    // Press left arrow
    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    expect(screen.getByText(/step 1/i)).toBeInTheDocument();
  });

  it('should not navigate forward if validation fails', () => {
    render(<NewEventPage />);

    // Don't fill required fields

    // Press right arrow
    fireEvent.keyDown(window, { key: 'ArrowRight' });

    // Should stay on step 1
    expect(screen.getByText(/step 1/i)).toBeInTheDocument();
  });

  it('should not navigate back from first step', () => {
    render(<NewEventPage />);

    // Press left arrow on step 1
    fireEvent.keyDown(window, { key: 'ArrowLeft' });

    expect(screen.getByText(/step 1/i)).toBeInTheDocument();
  });
});
```

---

## Test Coverage Goals

### Minimum Coverage Requirements
- **Unit Tests**: 85% coverage
- **Integration Tests**: 70% coverage
- **E2E Tests**: Critical paths 100% covered

### Critical Paths (Must Have E2E Tests)
1. ✅ Complete event creation (all 5 steps)
2. ✅ Blockchain registration after creation
3. ✅ AI poster generation
4. ✅ Poster refinement
5. ✅ Draft save and resume
6. ✅ Validation error handling

### Test Execution Strategy
- **Pre-commit**: Run unit tests (fast)
- **Pre-push**: Run integration tests
- **CI/CD**: Run all tests including E2E
- **Nightly**: Run full E2E suite with real blockchain (testnet)

---

## TDD Workflow Example

Here's how to implement one feature using TDD:

### Example: Implementing `useEventFormState` hook

**Step 1: Write Test First** ❌ (Failing)
```typescript
// useEventFormState.test.ts
it('should update field value', () => {
  const { result } = renderHook(() => useEventFormState());
  act(() => {
    result.current.updateField('title', 'Test Event');
  });
  expect(result.current.formData.title).toBe('Test Event');
});
```

**Step 2: Run Test** → ❌ Fails (hook doesn't exist)

**Step 3: Write Minimal Implementation** ✅
```typescript
// useEventFormState.ts
export function useEventFormState() {
  const [formData, setFormData] = useState(initialState);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return { formData, updateField };
}
```

**Step 4: Run Test** → ✅ Passes

**Step 5: Refactor** (if needed)
```typescript
// Add TypeScript types
export function useEventFormState() {
  const [formData, setFormData] = useState<FormState>(initialState);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return { formData, updateField };
}
```

**Step 6: Run Test Again** → ✅ Still passes

**Repeat** for next feature (add ticket, remove ticket, etc.)

---

## Implementation Order with TDD

Each phase follows this cycle:

1. ✅ Write test specifications (documented above)
2. ✅ Write failing tests
3. ✅ Implement feature (make tests pass)
4. ✅ Refactor
5. ✅ Verify all tests still pass
6. ✅ Move to next feature

### Sprint 1: Component Refactoring
- Day 1: Hooks (TDD: Write hook tests → Implement → Refactor)
- Day 2: Form components (TDD: Write component tests → Implement → Refactor)
- Day 3: Step components (TDD: Write step tests → Implement → Refactor)

### Sprint 2: Blockchain Integration
- Day 1: API routes (TDD: Write route tests → Implement → Refactor)
- Day 2: Integration (TDD: Write integration tests → Implement → Refactor)

### Sprint 3: AI Poster Generation
- Day 1-2: Service integration (TDD: Write service tests → Implement → Refactor)
- Day 3: Component integration (TDD: Write component tests → Implement → Refactor)

### Sprint 4: Prompt Customization
- Day 1: Refinement UI (TDD: Write UI tests → Implement → Refactor)
- Day 2: E2E flow (TDD: Write E2E tests → Implement → Refactor)

### Sprint 5: Polish
- Day 1: Auto-save, validation (TDD for each feature)
- Day 2: Mobile, keyboard navigation (TDD for each feature)

---

## Continuous Testing

**Test-Watch Mode** (during development):
```bash
npm run test:watch
```

**Coverage Report**:
```bash
npm run test:coverage
```

**E2E Tests** (Playwright):
```bash
npm run test:e2e
```

**Blockchain Tests** (with testnet):
```bash
BLOCKCHAIN_TESTS=true npm run test:integration
```

---

## Summary: TDD Benefits for This Project

1. ✅ **Confidence**: Every refactoring is safe with comprehensive tests
2. ✅ **Documentation**: Tests serve as living documentation
3. ✅ **Regression Prevention**: Catch bugs before they reach production
4. ✅ **Design Quality**: TDD forces better API design
5. ✅ **Faster Debugging**: Failing test pinpoints exact issue
6. ✅ **Onboarding**: New developers understand codebase through tests

---

## Next Steps

Once this plan is approved:

1. ✅ Create test specification files (all `__tests__` directories)
2. ✅ Write failing tests for Sprint 1 (hooks)
3. ✅ Implement hooks to make tests pass
4. ✅ Refactor and verify tests still pass
5. ✅ Proceed to next feature

**Ready to begin implementation with TDD approach?**
