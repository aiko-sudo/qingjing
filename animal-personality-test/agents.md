# AGENTS.md - Agent Coding Guide

## Project Overview

"三江源动物性格测试" (Three-River-Source Animal Personality Test) — a static, single-page personality quiz website. Users answer 30 OCEAN (Big Five) questions and are matched to one of 16 Tibetan plateau animals.

## Tech Stack

- Pure static site: HTML, CSS, vanilla JavaScript (no build tools, no frameworks, no npm)
- Deployed on Vercel (`vercel.json` is `{}`)
- Two CSS files: `styles.css` (base) → `modern-overrides.css` (glassmorphism/aurora theme override)
- Three JS files loaded in order: `questions.js` → `animals.js` → `app.js`
- Chinese (zh-CN) language throughout

## Build / Lint / Test Commands

No build tools, no bundler, no test framework, no linter. Validate by opening the site in a browser.

```bash
# Local development — open index.html directly or use a static server
npx serve .
python -m http.server 8080

# Deploy
vercel            # or push to git and let Vercel auto-deploy

# Merge promo HTML fragments (optional, unrelated to main app)
bash merge.sh
```

## Project Structure

```
├── index.html            # Single-page app: #home, #test, #result sections
├── styles.css            # Base styles, CSS variables, responsive breakpoints
├── modern-overrides.css  # Glassmorphism/aurora dark theme overrides
├── questions.js          # `const questions` — 30 quiz items with OCEAN scores
├── animals.js            # `const animals` — 16 animal personality objects
├── app.js                # Main logic: navigation, scoring, radar chart, sharing
├── images/               # Animal photos (jpg)
├── promote.html          # Promo landing page
├── promo-plan.html       # Merged promo plan
├── merge.sh              # Script to merge promo HTML fragments
└── vercel.json           # Empty {} — Vercel auto-detects static site
```

## Code Style Guidelines

### HTML

- `lang="zh-CN"`, UTF-8, proper viewport meta
- Sections use `<section id="home|test|result" class="page">`
- JS loaded at end of `<body>` in dependency order: questions → animals → app
- Inline `onclick` handlers on buttons (project convention)
- Use `role`, `tabindex`, `aria-label` for accessibility

### CSS

- CSS custom properties in `:root` (`--plateau-blue`, `--tibetan-gold`, etc.)
- Cascade: `styles.css` base → `modern-overrides.css` overrides for dark aurora theme
- Responsive breakpoints: `768px` (tablet) and `480px` (mobile)
- Touch optimizations: `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation`
- GPU animations: `translateZ(0)`, `will-change`, `contain`
- Glassmorphism: `backdrop-filter: blur()`, semi-transparent backgrounds
- Never use `overflow: hidden` on body/container — breaks mobile scrolling

### JavaScript

- Vanilla JS, no modules, no transpilation, no `const`/`let` at top level in legacy files
- Global functions (`startTest()`, `nextQuestion()`, `selectOption()`)
- DOM element caching at `DOMContentLoaded`
- Event delegation for dynamic `.option` elements
- `requestAnimationFrame` for DOM writes
- `DocumentFragment` for batch DOM insertions
- Canvas API for radar chart (OCEAN 5-dimension polygon)
- Touch/haptic: `navigator.vibrate()` with pattern map
- Debounced `resize` handler for radar chart redraw

### Data Structures

- **questions.js**: `[{ text, options: [{ text, scores: { O, C, E, A, N } }] }]`
- **animals.js**: `{ camelCaseKey: { name, mbti, emoji, tagline, colorClass, strategy, traits, description, background, match, tips, image } }`
- **Scoring**: OCEAN scores → MBTI 4-letter (E/I from E, N/S from O, F/T from A, J/P from C) → animal key

### Naming Conventions

- CSS classes: lowercase-hyphenated (`.question-card`, `.result-container`)
- CSS color classes: `.color-{mbti}` lowercase (`.color-intj`, `.color-enfp`)
- JS variables: camelCase
- JS functions: camelCase, descriptive (`calculateResults`, `drawOceanRadarChart`)
- DOM IDs: camelCase (`animalName`, `progressText`)

### Error Handling

- Canvas drawing guarded by null checks (`if (!canvas) return`)
- Image errors: `onerror="this.style.display='none'"`
- Clipboard API fallback to `alert()`
- Web Share API: `.catch(console.error)`
- IntersectionObserver: feature detection with fallback

### Mobile Responsiveness

- Always test at 375px (iPhone SE) and 768px viewports
- Result page is most complex — ensure `.result-card`, `.result-container`, canvas, text all fit `100vw`
- Avoid fixed pixel widths exceeding viewport; use `max-width` with `width: 100%`
- Watch `.result-card::before` / `::after` pseudo-elements (`width: 200%`, negative positioning) — mobile overflow source
- Ensure `box-sizing: border-box` behavior

### Known Issues

- `styles.css` lines 847-916: duplicate rules outside their `@media` block — left over from a bad merge
- `.aurora-bg` uses `100vw` with `position: fixed` — can cause horizontal scroll on mobile
- `.result-card::before` uses `width: 200%` with negative offset — overflows on small screens
- `questions.js` has 30 questions (README incorrectly says 36)
