# Unchained App – Senior Software Designer Style Guide

**Purpose:**  
This document is the single source of truth for the app’s design principles, ensuring consistent visual and UX standards across all screens, components, and marketing assets.

---

## 1. Brand Overview

- **Mission:** Disrupt the traditional ticketing industry by leveraging blockchain to eliminate counterfeiting, prevent scalping, reward fans, and empower communities.
- **Vision:** A transparent, fan-first ecosystem where events are free from monopolistic control.
- **Brand Personality:** Anti‑monopoly, punk/underground, rebellious yet purposeful.
- **Tone of Voice:** Bold, activist, gritty but welcoming to allies.

---

## 2. Logo Usage

- **Primary Logo:** Black square background with chain links + angled ticket, “UNCHAINED” text split around the logo.
- **Safe Space:** Maintain padding equal to the height of the “U” around all sides.
- **Minimum Size:** 48px height for digital use.
- **Do’s:**
  - Use the correct aspect ratio.
  - Keep logo in high contrast.
- **Don’ts:**
  - Alter proportions.
  - Apply heavy drop shadows or gradients.

---

## 3. Color Palette

- **Primary Colors:**
  - Resistance Red `#E04545`
  - Toxic Neon `#C4FF00`
- **Secondary Colors:**
  - Muted Teal `#5AB0A9`
- **Neutral Colors:**
  - Near Black `#0B0C0E`
  - Off-white Ink `#EAE6DA`
  - Medium Gray `#999999`
- **Usage:**
  - Neon is accent-only.
  - Red for action emphasis.
  - Maintain WCAG AA contrast.

---

## 4. Typography

- **Font Families:**
  - Headings: `"Special Elite", monospace`
  - Body: `"Inter", sans-serif`
- **Weights:** 400, 700
- **Hierarchy:**
  - H1: 2rem+ uppercase stencil/elite font
  - H2: 1.5rem
  - Body: 1rem
- **Spacing:**
  - Line height: 1.4–1.6
  - Letter spacing: headings +0.05em

---

## 5. Iconography

- **Style:** Gritty, SVG, monochrome.
- **Stroke Weight:** 2px
- **Color:** Match text or accent palette.
- **Examples:** Map pin, menu, close icons.

---

## 6. UI Components

- **Buttons:**
  - Primary: torn edge, subtle noise, neon pulse on hover.
  - Secondary: outline with rough stroke.
- **Inputs:**
  - Dark backgrounds, light text, typewriter feel.
- **Dropdowns:**
  - Match input styles, full-width responsive.
- **Cards:**
  - Dark textured background, off-white or accent text.

---

## 7. Imagery & Illustration Style

- **Photography:** High-contrast, grainy, poster-style.
- **Illustrations:** Propaganda/vintage resistance style.
- **Effects:** Duotone, multiply blend, subtle grain.

---

## 8. Layout & Spacing

- **Grid:** CSS grid + flexbox hybrid.
- **Breakpoints:**
  - Mobile: <768px
  - Tablet: 768–1024px
  - Desktop: >1024px
- **Spacing Units:** Use `--space-xs` to `--space-xl` scale.

---

## 9. Interaction & Motion

- **Animations:** Short, ease-out, 120–180ms.
- **Micro-interactions:** Hover scale, neon flicker.

---

## 10. Accessibility

- **Contrast:** ≥ WCAG AA.
- **Keyboard:** Full tab/focus support.
- **ARIA:** Descriptive roles on all nav, forms, and modals.

---

## 11. Content & Copywriting

- **Voice:** Rallying call to action, movement-focused.
- **CTA Examples:** “Join the Resistance”, “Overthrow the Masters”.

---

## 12. Component Code References

- **Repo:** `/src/components`
- **CSS:** `/src/styles/components`

---

## 13. Versioning & Maintenance

- **Maintainer:** Design Lead
- **Last Updated:** 2025-08-08
