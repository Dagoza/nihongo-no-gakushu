# Project: Nihongo Master — Japandi & Kawaii-Elegante Design System Refactoring

## Architecture
- **Framework**: Next.js 16.3.6 (App Router + Turbopack), React 19.0.0.
- **Styling Architecture**: Pure CSS Custom Properties in `app/globals.css` with component classes and scoped inline styles (no Tailwind CSS).
- **Core Principles**:
  - **"Ma" (間)**: Meaningful negative space, eliminating cognitive overload and monolithic text walls.
  - **Kawaii-Elegante**: Mature, friendly clay/matte aesthetic (Muji / Studio Ghibli inspired), procedural 3D/2D models, zero heavy external assets.
  - **8-Role Japandi Color Palette**: Aizome Indigo, Zen Vermilion (Shu-iro), Soft Matcha, Bamboo/Amber (Kohaku), Washi Paper, Sumi Ink, Sakura Petal, and Framing Slate.
  - **Bento Grid Architecture**: Modular cards with standard `border-radius: 20px`, `1px solid var(--border)`, and soft diffuse shadows.
  - **Progressive Disclosure**: 3-level model (Glance card -> On-demand detail/accordion/modal -> Action/Practice).
  - **Language Hierarchy**: Inter for UI, Hiragino Sans / Noto Sans JP with `--font-jp` for Japanese, non-overlapping ruby furigana (`line-height: 1.85-2.2`).
  - **Strict Standards**: Exclusive JLPT N5–N1 levels (zero CEFR), complete preservation of `audioManager`, quizzes, SRS, and state management.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | 8-Role Japandi Palette Tokens | CSS variables for Aizome, Shu-iro, Matcha, Kohaku, Torinoko, Sumi-iro, Sakura, Slate | M1 | Spec Miner § 3.2 |
| 2 | Zen Dark Mode Contrast Fix | Rebind `--primary: #6366f1` and accent tokens in `[data-theme="dark"]` for WCAG AA compliance | M1 | Spec Miner § 4.1 |
| 3 | Bento Radius Tokens | Define `--radius-bento: 20px`, `--radius-xl: 20px`, `--radius-2xl: 24px` | M1 | Spec Miner § 4.1 |
| 4 | CSS Variable Aliases | Add fallbacks for `--surface`, `--background`, `--text-primary`, `--text-secondary`, `--amber-700` | M1 | Explorer 2 § 1.3 |
| 5 | Base Card Standard | Update `.card`, `.bento-card`, `.module-hero-card` to 20px radius, 1px border, soft shadow | M1 | Spec Miner § 4.1 |
| 6 | Video JLPT Level Badges | Add missing `.level-n2` and `.level-n1` classes to `app/globals.css` | M1 | Spec Miner § 4.1 |
| 7 | Ruby Furigana Safety Margins | Global and scoped line-height (1.85–2.2) to prevent ruby collisions | M1 | Spec Miner § 3.5 |
| 8 | Mobile Bottom Safe Area | Increase `.main-container` bottom clearance for expanded `AudioPlayerBar` (170px) | M1 | Explorer 1 § 1.5 |
| 9 | Universal Module Hero Banner | Standardize headers with Icon Badge, category colors, title, and tour shortcut | M2 | Explorer 1 § 1.2 |
| 10 | StoryTab Hero Banner & Tour | Add top-level Hero Banner in `StoryTab` catalog with tour shortcut linked to `'story'` | M2 | Explorer 1 § 1.3 |
| 11 | JlptExamTab & SavedTab Banner Alignment | Align `.jlpt-top-banner` and `.saved-header-card` to Japandi Bento card structure | M2 | Explorer 1 § 1.2 |
| 12 | Generic Level Label Purge | Remove `(Principiante)`, `(Básico)`, `(Intermedio)` per AGENTS.md Rule 6 | M2 | Explorer 1 § 1.4 |
| 13 | VocabTab Bento & Progressive Disclosure | 20px card radius, fix undefined CSS variables, compact/expanded view toggle | M3 | Explorer 2 § 4.1 |
| 14 | KanjiTab Bento & Progressive Disclosure | 20px card radius, fix undefined CSS variables, collapse compound words (show 2 + accordion) | M3 | Explorer 2 § 4.1 |
| 15 | GrammarTab Bento & Furigana | 20px card radius, Japandi color tokens, accordion for examples, integrate `FuriganaText` | M3 | Explorer 2 § 4.1 |
| 16 | CurriculumTab Bento & Typography | 20px card radius, ruby line-height fix (2.0), replace hardcoded hexes with Japandi tokens | M4 | Explorer 2 § 4.1 |
| 17 | JlptExamTab Inline Furigana & Bento | 20px question cards, 1px border, inline `<ruby>` furigana, tabbed exam review | M4 | Explorer 2 § 4.1 |
| 18 | ConversationTab Furigana & Japandi Badges | 20px dialogue cards, 1px border, inline `<ruby>` furigana, Japandi speaker badges | M4 | Explorer 2 § 4.1 |
| 19 | StoryTab Bento & Grouping Pills | 20px story selector & breakdown cards, category segmentation pills, Japandi color tokens | M4 | Explorer 2 § 4.1 |
| 20 | YouTube & PDF Tab Bento Alignment | 20px cards, standard 1px borders, Japandi color accents in video and PDF views | M4 | Explorer 2 § 4.1 |
| 21 | Automated E2E Test Suite | Automated verification of 14/14 tests, clean Turbopack build, route rendering | M5 | User Request R4 |
| 22 | Final Design System Audit Report | Document comprehensive findings, token inventory, and before/after alignment | M5 | User Request R4 |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Design Tokens & CSS Foundation | `app/globals.css`: 8-role Japandi tokens, Zen dark mode contrast, Bento 20px radius tokens, CSS aliases, ruby line-height, mobile safe area | none | IN_PROGRESS |
| M2 | App Shell & Hero Header Standardization | All 11 tab headers (`StoryTab`, `SavedTab`, `JlptExamTab`, `VocabTab`, `GrammarTab`, etc.), tour shortcuts, Rule 6 generic label cleanup | M1 | PLANNED |
| M3 | Core Study Modules Refactoring | `VocabTab.jsx`, `KanjiTab.jsx`, `GrammarTab.jsx`: 20px Bento Grid, progressive disclosure, furigana integration, token alignment | M1 | PLANNED |
| M4 | Immersion & Exam Modules Refactoring | `CurriculumTab.jsx`, `JlptExamTab.jsx`, `ConversationTab.jsx`, `StoryTab.jsx`, `YouTubeImmersionTab.jsx`, `MaterialLibraryTab.jsx` | M1, M2 | PLANNED |
| M5 | E2E Testing, Audit & Verification | Run tests (`npm test`), build (`npm run build`), verify all 13 routes and 16 modales, compile `reports/DESIGN_SYSTEM_AUDIT_REPORT.md` | M1, M2, M3, M4 | PLANNED |

---

## Interface Contracts

### CSS Tokens (`app/globals.css`) ↔ Component Tabs
- All cards consume `border-radius: var(--radius-bento, 20px); border: 1px solid var(--border); box-shadow: var(--shadow-sm);`.
- All Japandi palette references consume:
  - `--aizome` / `--color-aizome`: Primary action indigo (`#4338ca` light / `#6366f1` dark).
  - `--shu-iro` / `--color-shu`: Zen Vermilion accent (`#e11d48` light / `#f43f5e` dark).
  - `--matcha` / `--color-matcha`: Soft Matcha success (`#059669` light / `#10b981` dark).
  - `--kohaku` / `--color-kohaku`: Bamboo/Amber warning (`#d97706` light / `#f59e0b` dark).
  - `--torinoko` / `--color-washi`: Washi Paper canvas (`#f8fafc`).
  - `--sumi-iro` / `--color-sumi`: Sumi Ink text/dark canvas (`#090d16` canvas / `#111827` surface).
  - `--sakura` / `--color-sakura`: Sakura Petal pink (`#fce7f3` bg / `#f472b6` accent).
- Fallback aliases:
  - `--surface` maps to `var(--bg-surface)`.
  - `--background` maps to `var(--bg-main)`.
  - `--text-primary` maps to `var(--text-main)`.
  - `--text-secondary` maps to `var(--text-muted)`.

### Header Module Contract
- Every tab component top-level view contains a `.module-hero-card` with:
  - Icon badge with category gradient.
  - Hierarchical title (H1/H2) and descriptive subtitle.
  - `.tour-info-shortcut-btn` linked to the tab's corresponding tour step (`onClick={() => appState.startTour?.('<tab_step>')}`).

### Japanese Furigana Contract
- Ruby elements (`<ruby>`, `<rt>`, `FuriganaText`) rendered within learning cards must enforce container `line-height: 1.85` to `2.2` to eliminate collision with upper text lines.

---

## Code Layout
- `app/globals.css`: Global design tokens, Bento grid classes, reset, typography, responsive media queries.
- `app/layout.jsx`: Root layout, theme attributes, AppShell wrappers.
- `components/tabs/`: All 11 tab views (`VocabTab`, `KanjiTab`, `GrammarTab`, `CurriculumTab`, `JlptExamTab`, `StoryTab`, `ConversationTab`, `YouTubeImmersionTab`, `MaterialLibraryTab`, `SavedTab`, `ProgressTab`).
- `components/layout/`: Navigation, `Header`, `AudioPlayerBar`, `HeaderDaruma`.
- `components/features/`: `ZenDaruma3D`, `JapanesePillarsGuide`, `StudyStatusBento`.
- `components/modals/`: 16 application modals (`PracticePadModal`, `DictionaryModal`, `SettingsModal`, etc.).
- `reports/`: Audit reports and evidence artifacts.
