---
name: 짜주께
colors:
  surface: '#fff8f5'
  surface-dim: '#e7d7cd'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e9'
  surface-container: '#fcebe1'
  surface-container-high: '#f6e5db'
  surface-container-highest: '#f0dfd6'
  on-surface: '#221a14'
  on-surface-variant: '#59413c'
  inverse-surface: '#382e28'
  inverse-on-surface: '#ffede4'
  outline: '#8d716a'
  outline-variant: '#e1bfb8'
  surface-tint: '#ae3115'
  primary: '#ae3115'
  on-primary: '#ffffff'
  primary-container: '#ff6b4a'
  on-primary-container: '#661000'
  inverse-primary: '#ffb4a3'
  secondary: '#655e44'
  on-secondary: '#ffffff'
  secondary-container: '#eadfbe'
  on-secondary-container: '#6a6248'
  tertiary: '#556158'
  on-tertiary: '#ffffff'
  tertiary-container: '#919d93'
  on-tertiary-container: '#29352d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a3'
  on-primary-fixed: '#3d0600'
  on-primary-fixed-variant: '#8c1900'
  secondary-fixed: '#ede2c1'
  secondary-fixed-dim: '#d0c6a6'
  on-secondary-fixed: '#201b07'
  on-secondary-fixed-variant: '#4d472e'
  tertiary-fixed: '#d9e6da'
  tertiary-fixed-dim: '#bdcabe'
  on-tertiary-fixed: '#131e17'
  on-tertiary-fixed-variant: '#3e4a41'
  background: '#fff8f5'
  on-background: '#221a14'
  surface-variant: '#f0dfd6'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system crafts an inviting, cheerful, and deeply tactile mobile-first experience. Tailored for casual date course planning and spontaneous couple outings, it departs from rigid transactional aesthetics in favor of a soft, confectionery-like Korean lifestyle sensibility.

### Brand Personality & Emotional Tone
- **Affectionate & Playful:** Interfaces feel like a considerate, witty companion planning the perfect day out. Microcopy utilizes comfortable informal Korean sentence stems (`~주께`, `추천해주께`, `골라주께`), reinforcing friendly intimacy.
- **Warm & Cozy:** Stepping away from stark corporate grays and sterile whites, the atmosphere leans on soothing cream-custard backdrops, warm toasted bread tones, and luscious tangerine pop accents.
- **De-cluttered & Stress-Free:** Planning should never feel like logistics management. Layouts emphasize airy breathing room, bubbly organic contours, and high-clarity glanceable cards.

### Aesthetic Movement: Soft Tactile Pop
The design language fuses Korean modern neo-grotesque rounded geometry with cozy tactile components. Elements evoke pillowy mochi or smooth pebbles, pairing extra-rounded corners, pill tags, and warm tinted cast shadows to build an interface that feels inherently huggable and satisfying to touch.

## Colors

The palette balances cozy domestic warmth with high-energy interaction drivers. Every shade is imbued with amber or brown warmth to eliminate harsh digital coldness.

### Palette Architecture
- **Primary Accent (`#FF6B4A` - Tangerine Coral):** Used for focal conversion buttons, active route highlights, interactive heart toggles, and primary navigation states. Delivers joyful, appetite-inducing vitality.
- **Canvas & Surface Tier:**
  - Base Screen Background: Cream Custard (`#FFFDF5`) transitioning to warm morning light (`#FFF9E6`).
  - Elevated Container / Cards: Pure Milk White (`#FFFFFF`) to ensure legible typographic clarity.
  - Secondary Container (`#FFF4D2`): Soft warm pudding tone for highlighted itinerary stops and callout notices.
  - Border Accents: Biscuit Yellow (`#FFE8B8` / `#F3E5C8`) at 1px-1.5px to softly ground cards without hard contrast.
- **Typography & Neutrals:**
  - Dominant Title: Warm Espresso Deep Brown (`#2D241E`), yielding strong contrast with zero chromatic harshness.
  - Body Text: Toasted Walnut (`#5E5248`) for effortless paragraph reading.
  - Subtitle & Metadata: Sandstone Tan (`#968677`).
- **Semantic & Tag Accents:**
  - Fresh Mint (`#E8F5E9` bg / `#2E7D32` text) for outdoor, walking, and scenic nature stops.
  - Sweet Peach (`#FFE0B2` bg / `#E65100` text) for cozy cafes, bakeries, and dinner itineraries.

## Typography

The typographic hierarchy is driven by **Plus Jakarta Sans**, chosen for its friendly, wide apertures and rounded geometry that harmonizes seamlessly with modern Korean rounded typefaces (such as Pretendard and Gothic A1).

### Typographic Principles
- **Snappy Weight Contrast:** Display headers employ a punchy `800` (ExtraBold) or `700` (Bold) to make date plan names and venue categories bounce off the page with playful energy.
- **Comfortable Readability:** Body text sticks to `500` (Medium) and `400` (Regular) on `#5E5248` to prevent visual fatigue while browsing long listicles or venue descriptions.
- **Pill Labels:** Micro-badges and chips rely on tight, compact sizing (`11px` to `12px`) rendered in `600`/`700` weight with neutral or slightly expanded tracking (`+0.01em`) for immediate legibility inside pill capsules.

## Layout & Spacing

This design system utilizes a mobile-first 4-column fluid layout on handheld screens that gracefully scales to a centered 600px phone-shell column or responsive dual-pane split on tablet and desktop surfaces.

### Spatial Rhythm
- **Rhythm Base:** A strict 4px/8px incremental scale anchors all element padding and stack spacing.
- **Safe Margins:** Standard canvas margin is set to `1.25rem` (20px) to give mobile edges ample padding while maximizing viewport surface area for imagery and cards.
- **Section Gaps:** Vertical rhythm separates distinct timeline stops or itinerary buckets with `1.5rem` (24px) to `2rem` (32px), creating distinct "chapters" along a day's date course.

## Elevation & Depth

To avoid synthetic, harsh drop shadows, elevation relies on **warm ambient glows** and **subtle outline grounding**.

### Depth Layers
- **Ground (Level 0):** Custard canvas (`#FFFDF5`). No shadow.
- **Resting Card (Level 1):** Pure white background (`#FFFFFF`) with a 1px continuous border in `#FFE8B8`. Cast shadow: `0px 6px 18px rgba(230, 160, 110, 0.08)`. The warm coral-peach tinted shadow gives an organic lifted look.
- **Floating Pill / Modal / Bottom Sheet (Level 2):** Sticky navigation pills and bottom sheets utilize `0px 12px 32px rgba(94, 82, 72, 0.12)` accompanied by an upper inner highlight of `inset 0px 1px 0px rgba(255, 255, 255, 0.8)`.
- **Interactive Press State:** Active button taps physically depress slightly (`transform: scale(0.97)`), diminishing the ambient drop shadow for instantaneous tactile feedback.

## Shapes

Roundedness in this system is unapologetically bouncy, organic, and friendly. Standardizing on **Pill-shaped (Level 3)**, sharp corners are entirely excluded from the user interface.

### Radii Rules
- **Interactive Pills (`rounded-full` / `9999px`):** Primary action buttons, floating filtering tags, category pills, and floating action prompts.
- **Course & Venue Cards (`rounded-lg` / `24px` to `28px`):** All major content modules, map preview popups, and course itinerary cards use expansive, friendly 24px-28px radii.
- **Inner Asset Insets (`rounded-md` / `16px`):** Venue thumbnails and embedded photos inside cards mirror the enclosing outer radius without clipping awkward seams.

## Components

### Buttons
- **Primary CTA ("코스 짜주께"):** Pill shape (`rounded-full`), solid Tangerine Coral (`#FF6B4A`), pure white bold typography, padded generously (`14px 28px`). Shadow: `0px 8px 20px rgba(255, 107, 74, 0.3)`.
- **Secondary CTA:** Pill shape, soft custard container (`#FFF4D2`), text in Espresso (`#2D241E`), border: 1.5px solid `#FFE8B8`.
- **Ghost Action:** Pill shape, transparent background, text in `#5E5248`, hover/pressed state in `#FFF3CC`.

### Chips & Filter Pills
- **Unselected:** Canvas tone `#FFFFFF`, 1.5px border `#FFE8B8`, text in `#5E5248`, padding `8px 16px`, pill radius.
- **Selected:** Solid Coral `#FF6B4A`, white text, soft glow shadow.
- **Tag Badges:** Mini pill (`6px 12px`), Mint (`#E8F5E9`) for park/stroll, Peach (`#FFE0B2`) for dining/cafe.

### Cards (Course Itinerary & Spot Cards)
- **Structure:** `#FFFFFF` surface, 24px corner radius, 1.5px border in `#F3E5C8`. Generous inner padding (16px to 20px).
- **Course Timeline Node:** Displays step-by-step numbers (1, 2, 3) inside 32px solid coral circles connected by dashed warm cream lines (`#FFE8B8`).

### Input Fields & Search Bars
- **Shape & Surface:** Pill shape (`9999px` height container), background in `#FFFFFF`, border `1.5px solid #FFE8B8`.
- **Placeholder Text:** Tinted `#968677` ("어디서 데이트할까? 지역이나 키워드를 적어주께").
- **Focus State:** Border transitions to Tangerine Coral (`#FF6B4A`) with a subtle `0 0 0 3px rgba(255, 107, 74, 0.15)` focus ring.

### Checkboxes & Toggle Switches
- **Toggles:** Pill track in `#FFE8B8` (inactive) shifting to `#FF6B4A` (active). Thumb is a pure white bubble with a slight warm drop shadow.
- **Selection Checks:** Circular pill checkboxes; unselected has a warm border `#FFE8B8`, active fills with `#FF6B4A` housing a clean white checkmark.

### Specialized Component: Route Timeline Connector ("코스 타임라인")
- Vertical or horizontal path connecting cards with a soft dashed stroke, punctuated with estimated walk or transport bubble tags ("도보 7분", "차량 12분") styled in `#FFF9E6` with `#5E5248` micro-labels.