# Codebase Architecture & Component Map

**Project:** Dev Patel Portfolio & Content Architecture Studio  
**Audit Scope:** Comprehensive file-by-file analysis of every source module, data interface, styling layer, and build script.

---

## 1. Directory Tree & File Inventory

```
MY PORTFOLIO/
├── index.html                           # Single-page storyboard + vertical full-page views
├── cms.html                             # Content Architecture Studio (Private Curation Room)
├── package.json                         # Dependencies & run scripts
├── tsconfig.json                        # Strict TypeScript compilation rules
├── vite.config.ts                       # Vite 6 + Tailwind CSS v4 build configuration
├── .gitignore                           # Git exclusion rules
├── src/
│   ├── main.ts                          # Main application bootstrap & lifecycle coordinator
│   ├── cms.ts                           # CMS Studio user interaction & DOM controller
│   ├── data/
│   │   └── portfolioData.ts             # Master TypeScript models & CV-grounded seed datasets
│   ├── lib/
│   │   ├── cmsStore.ts                  # Reactive localStorage state machine & event bus
│   │   ├── dynamicContent.ts            # DOM injection of curated items into storyboard
│   │   ├── verticalViews.ts             # Full-page vertical views (Archive slide-up, Article slide-down)
│   │   ├── horizontalTrack.ts           # Pinned dual-axis GSAP track & midpoint pause geometry
│   │   ├── navigationMenu.ts            # Morphing SVG hamburger & fullscreen index jumps
│   │   ├── loader.ts                    # Minimal hairline progress sequence & GSAP fade
│   │   ├── yearTicker.ts                # Hero year strip ticker animation
│   │   ├── clock.ts                     # Real-time London/UTC telemetry clock
│   │   ├── themeManager.ts              # Fixed rail color inversion observer
│   │   ├── smoothScroll.ts              # Lenis virtual momentum scrolling & scroll locking
│   │   └── hoverPortal.ts               # Cursor-following telemetry blueprint preview
│   └── styles/
│       ├── tokens.css                   # Continuous fluid scaling engine (--scale) & palette
│       └── main.css                     # Resets, kinetic directional underlines, Lenis styles
```

---

## 2. File-by-File Technical Deep Dive

### 1. `index.html` (Master Storyboard & Modals)
* **Lines of Code:** ~710 lines
* **Functional Role:** The single entry document for the public-facing portfolio. Contains the fixed left navigation rail, fullscreen overlay menu, eight horizontal panels, and two hidden full-page vertical views.
* **Key DOM Structure:**
  - `[data-intro-header]`: Fixed 64px left rail (`z-[110]`) with morphing hamburger icon, vertical rotated monograms (`DEV PATEL · 2026`), and a dynamic progress hairline (`data-header-scroll-progress`).
  - `#fullscreen-menu`: Fixed modal overlay (`z-[105]`) revealing chapter index jumps (`00. System Initialization` $\to$ `06. Direct Channels`).
  - `[data-horizontal-pin]` & `[data-horizontal-track]`: Viewport container that pins on desktop (`100dvh`) and translates horizontally along the X-axis.
  - Eight Storyboard Panels:
    - **Panel 00 (`#hero`):** Monumental serif typography (`DEV PATEL`), quiet subtitle (`Applied Mathematics & Computer Science`), London UTC clock, and coordinate tags.
    - **Panel 01 (`#about`):** Natural two-paragraph bio lead + 3-discipline focus columns (Applied Mathematics, Software Engineering, Data & Predictive Modelling).
    - **Panel 02 (`#education`):** Upton Court Grammar School (Achieved AAA inline), Cambridge STEM Smart, De Salis GCSEs, and open typographic competition summaries (M3 Challenge, Code Quest).
    - **Panel 03 (`[data-transition-section]`):** Cinematic pause panel ("THE SYSTEMS") with typographic split. Preserved for future user concept.
    - **Panel 04 (`#experience`):** Highlighted placements (BP, Cognizant, Lockheed Martin, HS2) with concise narrative summaries and "View All Work Experience (N) →" trigger.
    - **Panel 05 (`#projects`):** Highlighted computational projects (Backtest Overfitting, Fourier Transform, M3 Challenge) with live hover preview portal and "View All Projects (N) →" trigger.
    - **Panel 06 (`#blog`):** Curated research dispatches (Deflated Sharpe Ratio, Autonomous Weaponry EPQ, Fourier Intuition) with "Read Essay →" triggers and "View All Dispatches (N) →" trigger.
    - **Panel 07 (`#contact`):** High-contrast closing panel with direct email, GitHub, and LinkedIn links.
  - Full-Page Vertical Views:
    - `#vertical-archive-view`: Full-screen overlay (`z-[150]`) sliding up from bottom for complete project and experience archives.
    - `#vertical-article-view`: Full-screen overlay (`z-[160]`) sliding down from top for focused 48rem reader layout.

---

### 2. `cms.html` (Content Architecture Studio)
* **Lines of Code:** ~255 lines
* **Functional Role:** Private administrative curation studio. Completely decoupled from the public storyboard (no links exist on `index.html`).
* **Key Features:**
  - **Tabbed Interface:** Projects, Work Experience, Research Dispatches, and Display Limits & Identity.
  - **Display Limit Controls:** Real-time range sliders configuring upper limits for main storyboard items (default: 3).
  - **Live Indicators:** Dynamic badge showing `Showing N of M allowed on main storyboard · K in extended drawer`.
  - **One-Click Curation:** Instant toggle between `Highlight on Story` and `Move to Drawer`.
  - **Full CRUD Modals:** Add and edit forms for all items with validation.
  - **Data Resilience:** Export complete portfolio state as formatted JSON and import external JSON payloads with real-time refresh.

---

### 3. `src/main.ts` (Application Orchestrator)
* **Lines of Code:** 39 lines
* **Functional Role:** Bootstrap controller coordinating sub-systems on `DOMContentLoaded`:
  1. Initializes Lenis smooth virtual scroll (`initSmoothScroll(true)`).
  2. Initializes London real-time telemetry clock (`initTelemetryClock()`).
  3. Initializes dynamic rail theme synchronizer (`initThemeManager()`).
  4. Injects dynamic CMS content into storyboard panels (`renderDynamicContent()`).
  5. Initializes slide-up and top-slide vertical views (`initVerticalViews()`).
  6. Initializes fullscreen navigation menu (`initNavigationMenu()`).
  7. Initializes hairline loader sequence (`initFolioLoader()`).
  8. Initializes pinned horizontal track (`initHorizontalTrack()`) after loader completion.

---

### 4. `src/data/portfolioData.ts` (Data Contracts & CV Seeds)
* **Lines of Code:** 319 lines
* **Functional Role:** Central data contract defining all TypeScript interfaces and initial CV-grounded seed constants.
* **Core Interfaces:**
  - `ProjectItem`: `id`, `title`, `subtitle`, `category`, `year`, `description`, `metrics[]`, `tags[]`, `featured: boolean`, `codeSnippet?`.
  - `ExperienceItem`: `id`, `role`, `company`, `location`, `period`, `description`, `bulletPoints[]`, `featured: boolean`, `category: "work" | "competition"`.
  - `EducationItem`: `id`, `institution`, `program`, `period`, `grades`, `details[]`, `featured: boolean`.
  - `BlogItem`: `id`, `title`, `readTime`, `date`, `excerpt`, `content`, `tags[]`, `featured: boolean`.
  - `SiteSettings`: `name`, `status`, `title`, `bio`, `location`, `email`, `github`, `linkedin`, `featuredProjectsLimit`, `featuredExperienceLimit`, `featuredBlogsLimit`.

---

### 5. `src/lib/cmsStore.ts` (Reactive State Machine)
* **Lines of Code:** 278 lines
* **Functional Role:** LocalStorage persistence engine and reactive event bus.
* **Key Mechanics:**
  - **Storage Keys:** `cs_portfolio_settings`, `cs_portfolio_projects`, `cs_portfolio_experience`, `cs_portfolio_education`, `cs_portfolio_blogs`.
  - **Event Bus:** Dispatches custom DOM event `cms-store-updated` on any mutation (add, edit, delete, toggle featured, update limit).
  - **Public APIs:** `getSettings()`, `saveSettings()`, `getProjects()`, `saveProjects()`, `getFeaturedProjects()`, `getExperience()`, `saveExperience()`, `getFeaturedExperience()`, `getBlogs()`, `saveBlogs()`, `getFeaturedBlogs()`, `exportCompleteState()`, `importCompleteState()`, `resetToDefault()`.

---

### 6. `src/lib/dynamicContent.ts` (DOM Content Synchronizer)
* **Lines of Code:** 180 lines
* **Functional Role:** Injects items from `cmsStore` into `index.html` panels dynamically.
* **Key Operations:**
  - Listens for `cms-store-updated` and re-renders panels without reloading the browser.
  - Injects curated projects into `#projects-container`, applying `[data-project-id]` for hover portal synchronization.
  - Injects curated placements into `#experience-container`.
  - Injects curated dispatches into `#blogs-container`.
  - Updates counters on "View All" buttons: e.g. `View All Work Experience (${all.length}) →`.

---

### 7. `src/lib/verticalViews.ts` (Full-Page Editorial Views)
* **Lines of Code:** 288 lines
* **Functional Role:** Replaces the legacy side drawer with full-page vertical views.
* **Key Operations:**
  - **`openArchiveView(category: "experience" | "projects" | "blogs")`:**
    - Locks Lenis scroll.
    - Reveals `#vertical-archive-view` with GSAP `fromTo(..., { y: "100%", opacity: 0 }, { y: "0%", opacity: 1, duration: 0.6, ease: "power3.out" })`.
    - Populates centered 56rem column with complete records, bullet points, and unclipped code snippets.
  - **`openArticleView(blogId: string)`:**
    - Looks up blog entry from `cmsStore`.
    - Reveals `#vertical-article-view` with GSAP `fromTo(..., { y: "-100%", opacity: 0 }, { y: "0%", opacity: 1, duration: 0.6, ease: "power3.out" })`.
    - Populates centered 48rem reader layout with title, date, reading time, excerpt, and full paper text.
  - **Dismissal:** ESC key listener, top/bottom close buttons with kinetic underlines, smooth GSAP exit, and Lenis scroll unlock.

---

### 8. `src/lib/horizontalTrack.ts` (Dual-Axis GSAP Track)
* **Lines of Code:** 279 lines
* **Functional Role:** Core motion controller for horizontal translation on desktop.
* **Key Operations:**
  - Pinned viewport at `100dvh` using GSAP ScrollTrigger.
  - Computes `getScrollDistance() = track.scrollWidth - window.innerWidth`.
  - Manages midpoint pause geometry: pins during `zoomDuration` while media expands and typography splits.
  - **`scrollToSection(targetId)`:** Computes precise target scroll coordinate, accounting for `zoomDuration` if target lies past the midpoint.
  - **`updateRailTheme()`:** Samples active panel at `x = 0.45 * window.innerWidth` and swaps rail color variables.

---

### 9. `src/lib/navigationMenu.ts` (Fullscreen Menu)
* **Lines of Code:** 132 lines
* **Functional Role:** Controls the fullscreen chapter navigation overlay.
* **Key Operations:**
  - Toggles morphing hamburger lines into a clean `✕` (Close).
  - Opens `#fullscreen-menu` with staggered line reveal animation (`stagger: 0.05`).
  - Handles chapter link clicks: closes menu smoothly, unlocks scroll, and delegates to `scrollToSection(targetId)`.

---

### 10. `src/lib/loader.ts` (Minimal Loading Screen)
* **Lines of Code:** 54 lines
* **Functional Role:** Replaced the noisy timeline strip with a quiet, distraction-free loading screen.
* **Key Operations:**
  - Displays hairline progress indicator and subtle initials (`DEV PATEL`).
  - Animates progress bar from 0% to 100% over 600ms via GSAP.
  - Gently dissolves the loading overlay (`opacity: 0, pointerEvents: "none"`) and unblocks virtual scroll.

---

### 11. `src/lib/smoothScroll.ts` (Lenis Controller)
* **Lines of Code:** 52 lines
* **Functional Role:** Virtual scroll momentum manager.
* **Key Operations:**
  - Exports `initSmoothScroll(startLocked)`, `lockScroll(boolean)`, and `getLenis()`.
  - Configures exponential deceleration easing curve: `(t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))`.
  - Manages `requestAnimationFrame` render loop.

---

### 12. `src/styles/tokens.css` & `src/styles/main.css`
* **Tokens (`tokens.css`, 88 lines):**
  - Defines the fluid mathematical scale token: `--scale: calc(100vw / 144)` (Desktop) and `calc(100vw / 39)` (Mobile).
  - Derived spatial tokens: `--vg`, `--display-fs`, `--list-fs`, `--cta-fs`, `--name-fs`, `--year-slot`, `--portrait-w`, `--portrait-h`.
  - Monochromatic palette variables: `--color-carbon-dark` (`#080808`), `--color-carbon-espresso` (`#0a0a0a`), `--color-paper-light` (`#ffffff`), `--color-hairline-dark` (`#222222`).
* **Main Styles (`main.css`, 175 lines):**
  - `@import "tailwindcss";`
  - Kinetic directional link underlines (`.to-link-underline`, `.from-link-underline`).
  - Vertical typography utilities (`.vt-rl`, `.vt-reading-up`).
  - Lenis scrollbar hiding and container lock rules.
