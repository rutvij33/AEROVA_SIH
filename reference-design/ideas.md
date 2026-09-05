# AEROVA Design Direction

## Ground-truth brief

This project follows the user-provided AEROVA landing-page brief as the visual source of truth. The intended experience is a premium, monochrome, editorial aviation-data platform for India: pure black background, high-contrast white type, smoked-glass cards, quiet aviation texture, and precise motion. The page should feel like a hybrid of a research publication, an air-traffic control instrument, and a luxury data product.

## Chosen approach

### Design Movement
Contemporary Swiss editorialism meets aviation instrumentation. The design borrows from Swiss grid discipline, modernist typography, and the calibrated visual language of flight operations without becoming a literal cockpit dashboard.

### Core Principles
1. **Signal over spectacle:** Large typography, short labels, and thin rules create hierarchy without decorative clutter.
2. **Glass as atmosphere:** Cards feel like smoked instrument lenses—translucent, restrained, and layered over the aviation backdrop.
3. **Asymmetric editorial pacing:** Sections alternate between oversized statements, split layouts, offset cards, and measured data rows.
4. **Evidence-led warmth:** Metrics and methodology lead the story, while subtle human language keeps the product approachable.

### Color Philosophy
The palette is intentionally near-colorless. Black establishes seriousness and quiet focus; chalk-white typography carries authority; softer gray values distinguish metadata and secondary information. One restrained signal gray, used sparingly in rules and progress details, suggests runway markings and radar traces without introducing a competing accent hue.

### Layout Paradigm
The page uses wide, asymmetric compositions rather than a centered marketing stack: a split hero with an oversized headline, edge-aligned section labels, staggered glass cards, and a long-form editorial rhythm. The container is generous, but content does not always share the same left edge.

### Signature Elements
- A faint aviation route-line texture made from CSS radial gradients and thin SVG-like rules, sitting behind sections as a shared environmental layer.
- Circular “India Airfare Index” seal treatment with compact tracking and a calibrated crosshair detail.
- Monospace micro-labels and data chips that resemble instrument readouts without imitating a specific aviation system.

### Interaction Philosophy
Interactions should feel deliberate and instrument-like. Buttons lift minimally, cards reveal a quiet top rule, anchors glide to their destination, and accordion answers open with controlled height/opacity transitions. Nothing bounces or glows aggressively.

### Animation
Use Framer Motion `whileInView` for one-time reveals with 30–80ms stagger. Enter from `opacity: 0` and `y: 18` or `scale: 0.98`; never from `scale: 0`. Keep hover effects under 220ms and respect reduced-motion preferences. The headline and hero action can resolve from the brief’s intentionally hidden state into view on mount, preserving the intended cinematic reveal while remaining usable.

### Typography System
- **Display:** Space Grotesk, 600–700, uppercase for the main headline and major statements.
- **Body:** Inter, 400–500, with relaxed line height for descriptions.
- **Instrumentation:** ui-monospace / Geist Mono fallback, uppercase and tracked out for metadata, step numbers, and data chips.
- Hierarchy is created through size, weight, and tracking before color; muted copy uses opacity rather than a new hue.

### Brand Essence
**Real-time airfare intelligence for India’s most consequential price signals.**

Personality: **measured, incisive, future-facing**.

### Brand Voice
Headlines are concise and declarative. CTAs are direct but not salesy. Microcopy should sound like a research note translated into a premium product interface.

Example lines:
- “See the movement before it becomes the headline.”
- “Collect cleaner signals. Calculate a sharper index.”

### Wordmark & Logo
The AEROVA wordmark stays typographic and bold, but is paired with a bespoke mark: a compact four-line “vector wing” symbol built from two opposing chevrons and a central flight path. It should read as an abstract trajectory, not a literal plane icon. The mark is used in the header and favicon at a clear, visible size.

### Signature Brand Color
**Runway Chalk** — `#f5f5f1`, a warm-white signal tone used for foreground type, primary actions, and the index seal. The near-neutral warmth makes the monochrome system feel more considered than pure white while preserving the user-requested high-contrast language.

## Content and implementation notes

- Use the provided content as the page copy, including the exact “Collect / Clean / Calculate” and process language.
- The brief references a provided looping aviation video, but no video file was attached alongside the text. The implementation should therefore use a dark cinematic aviation image/texture fallback with an optional remote video source hook that can be swapped for the user’s asset later.
- Platform metrics such as 100+, 24/7, 2M+, and 0.04% must be framed as AEROVA platform metrics, not official government statistics.
- All navigation and CTA anchors are functional within the single page. Placeholder/social links should surface a small “coming soon” toast rather than dead-ending.

## Style Decisions

- Aviation texture is treated as a recurring environmental layer, not a one-off hero effect: the fixed route grid is slightly more visible and major lower sections add their own arc/rule overlays.
- Lower utility sections keep the authored instrument rhythm through staggered process cards, offset metric blocks, mono readouts, and persistent rule systems rather than defaulting to a uniform SaaS grid.
- CTA and footer wording stays concise and operational. The strongest language centers on signal, movement, monitoring, and index construction rather than broad conversion promises.
