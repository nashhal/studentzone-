# Yemen Study — Interface refinement and quality gates

## Scope
Refine the existing Arabic RTL learning interface while preserving its current routes, learning tools, course data, and editorial navy/blue identity. The goal is clearer reading order, calmer navigation, more usable lesson actions, and a responsive layout rather than a visual rebrand.

## Skill-to-implementation map
- Impeccable: applied polish/craft-floor principles: readable content hierarchy, consistent rhythm, clear focus states, responsive adaptation, and reduced-motion support. Existing content and behavior remain intact.
- React Bits: adapted the restrained FadeContent pattern for a single hero visual entrance. It is deliberately not repeated on every section.
- GSAP: uses @gsap/react useGSAP() with a scoped ref and automatic context cleanup. Only opacity, transform and a short bounded blur are animated; layout properties are not animated.
- Transitions.dev: uses short motion tokens and an origin-aware dropdown entrance. Each transition has a reduced-motion fallback.
- Playwright: adds end-to-end checks for the public learning route, the in-site lesson action, mobile menu behavior, reduced motion, and horizontal overflow across viewport widths.
- test-skill: this command family evaluates an agent skill's instruction-following under pressure; it is not a browser/UI test runner. Website workflows are therefore checked with Playwright rather than misusing a skill-evaluation command.

## Verification
The Playwright workflow runs on pull requests and on main. It builds the production bundle, serves the generated site at the GitHub Pages base path, and exercises desktop and mobile Chromium contexts. A clean CI run is required before merging.

## Motion and accessibility rules
- Essential content is visible without animation.
- prefers-reduced-motion: reduce disables nonessential movement.
- Keyboard focus remains clearly visible.
- Primary action controls use touch-friendly dimensions.
- Responsive tests include 320, 390, 768, 1024, and 1440 CSS-pixel widths.


## Visual redesign with photography and learning metrics
- Replaced the decorative hero panel with real editorial study photography and accessible alt text.
- Added three image-led learning-skill pathways: scientific understanding, problem solving, and study planning.
- Added photography to subject landing pages and featured course discovery.
- Added a student performance panel based on locally recorded completed lessons, attempts, saved items, and answer accuracy.
- Accuracy is explicitly labelled as an aggregate attempt metric, not a per-skill mastery score.
- Image credits and the Pexels licence are linked in the site footer area.


## Visual verification additions
- New hero, skill pathway and course-page photographs are sourced from Pexels and credited in the interface.
- The student dashboard exposes local activity metrics: completed lessons, saved lessons, quiz attempts and aggregate answer accuracy.
- Accuracy is deliberately not represented as a per-skill mastery score.
- Playwright verifies photo sources and alt text, all skill and tool entries, the dashboard metric panel, course pathway and common viewport overflow.
