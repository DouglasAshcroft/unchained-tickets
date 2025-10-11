# Poster Upload Fix — 2025-10-10

## Issues Fixed

### 1. Data URI Fallback Issue
**Problem:** Uploaded poster images (base64 data URIs) were falling back to the resistance poster instead of displaying the uploaded image.

**Root Cause:** The `sanitizePosterImageUrl()` function in [lib/utils/posterImage.ts](lib/utils/posterImage.ts) was rejecting data URIs because they don't match the `http:` or `https:` protocol check.

**Fix:** Added explicit support for data URIs before the protocol validation:
```typescript
// Allow data URIs (base64 encoded images from file uploads)
if (url.startsWith('data:image/')) {
  return url;
}
```

### 2. Missing Drag-and-Drop Functionality
**Problem:** The poster upload area displayed text saying "Drop an image or click to upload" but had no drag-and-drop handlers implemented.

**Fix:** Added complete drag-and-drop support in [app/events/new/page.tsx](app/events/new/page.tsx):

1. **State tracking:** Added `isDraggingPoster` state to track drag status
2. **File processing:** Refactored file handling into reusable `processPosterFile()` function
3. **Event handlers:**
   - `handlePosterDragOver` — Prevents default and shows visual feedback
   - `handlePosterDragLeave` — Removes drag-active styling
   - `handlePosterDrop` — Processes dropped image files
4. **Visual feedback:** Upload area now highlights with acid-400 border/background when dragging

## Files Modified

### [lib/utils/posterImage.ts](lib/utils/posterImage.ts)
- Added data URI support (lines 8-11)

### [app/events/new/page.tsx](app/events/new/page.tsx)
- Added `isDraggingPoster` state (line 126)
- Refactored `processPosterFile()` helper (lines 242-253)
- Updated `handlePosterFileChange()` to use helper (lines 255-265)
- Added `handlePosterDragOver()` (lines 267-270)
- Added `handlePosterDragLeave()` (lines 272-275)
- Added `handlePosterDrop()` (lines 277-285)
- Added drag event handlers to upload div (lines 515-517)
- Enhanced visual feedback with drag state (lines 521-522)

## Testing Checklist

- [ ] Upload poster via file picker works
- [ ] Drag and drop poster image works
- [ ] Upload area highlights when dragging file over it
- [ ] Uploaded images display in preview (not resistance poster fallback)
- [ ] Data URIs persist through event creation API
- [ ] Created events display uploaded poster correctly
- [ ] Removing uploaded file clears preview
- [ ] Image type validation works (rejects non-image files)

## Build Status

✅ Build succeeds with 29 routes
✅ No TypeScript errors
✅ No linting errors

## Next Steps

Continue with remaining deployment plan phases (Phase 2+) as outlined in [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md).
