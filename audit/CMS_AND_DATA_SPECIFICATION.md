# CMS Studio & Reactive Data Engine Specification

**System Component:** Content Architecture Studio (`cms.html`) & Reactive Store (`src/lib/cmsStore.ts`)  
**Design Philosophy:** Balanced Editorial Curation, Strict Display Upper Bounds, and Complete Data Autonomy  
**Storage Architecture:** Client-side `localStorage` with Custom DOM Event Bus & JSON Portability  

---

## 1. System Purpose & Functional Scope

The Content Architecture Studio was designed in direct response to the user's directive:
> *"I would also like a fully fledged CMS page for every updatable aspect of this website like projects and experience and blogs section - (have like a sensible upper limit for each so it does not get cluttered, or atleast an upper limit for what is shown mainly - like what is highlighted and put on display - like a select few of the entire list - and then some action to show more of that category; more experience, more projects or more blogs... also remove all CMS links/navigation options from the user facing side of the website)."*

### Key Functional Principles:
1. **Decoupled from Public UI:** Zero administrative links, buttons, or indicators exist on `index.html`. Access is strictly through direct URL navigation to `/cms.html`.
2. **Display Limit Guardrails:** Prevents visual clutter by strictly capping the number of items featured on the main storyboard (default: 3 max per category).
3. **One-Click Curation:** Items can be seamlessly toggled between `Highlight on Story` (featured on the main storyboard) and `Move to Drawer` (accessible only via the dedicated full-page vertical archive views).
4. **Zero-Backend Portability:** Runs entirely in the browser using `localStorage`. Content changes reflect instantly across open browser tabs via custom reactive DOM events.
5. **State Resilience & Migration:** Offers one-click complete JSON backup export, external JSON restore, and factory reset to original CV seeds.

---

## 2. Master Data Schemas & Contracts

The data models are formalized in `src/data/portfolioData.ts`. Below is the complete schema definition:

### 1. `SiteSettings` Schema
Controls global persona identity, header branding, and storyboard upper bounds:

```typescript
export interface SiteSettings {
  name: string;                   // Display headline (e.g. "DEV PATEL")
  status: string;                 // Operational telemetry status (e.g. "ACTIVE CANDIDATE")
  title: string;                  // Subtitle (e.g. "Computer Science & Mathematics · Degree Apprenticeship Candidate")
  bio: string;                    // Primary editorial lead paragraph for Chapter 01
  location: string;               // Geographic indicator (e.g. "LONDON & SLOUGH, UK")
  email: string;                  // Direct inquiry email address
  github: string;                 // Profile URL
  linkedin: string;               // Profile URL
  featuredProjectsLimit: number;  // Maximum projects permitted on main storyboard (Default: 3)
  featuredExperienceLimit: number;// Maximum placements permitted on main storyboard (Default: 3)
  featuredBlogsLimit: number;     // Maximum dispatches permitted on main storyboard (Default: 3)
}
```

---

### 2. `ProjectItem` Schema
Represents computational and mathematical engineering case studies:

```typescript
export interface ProjectItem {
  id: string;                     // Unique kebab-case slug (e.g. "backtest-overfitting")
  title: string;                  // Project headline (e.g. "Backtest Overfitting Detector")
  subtitle: string;               // Descriptive sub-heading (e.g. "Brent & Henry Hub Spot Prices Analysis")
  category: string;               // Domain classification (e.g. "Quantitative Finance & Python")
  year: string;                   // Numerical completion year (e.g. "2026")
  description: string;            // Core abstract explaining methodology and technical edge
  metrics: string[];              // Array of empirical quantitative metrics and findings
  tags: string[];                 // Array of technology and domain tags (rendered inline without pill boxes)
  featured: boolean;              // true = displayed on main storyboard; false = archive only
  codeSnippet?: string;           // Formatted algorithm snippet displayed in full-page archive
}
```

---

### 3. `ExperienceItem` Schema
Represents industrial placements, engineering leadership, and team competitions:

```typescript
export interface ExperienceItem {
  id: string;                     // Unique kebab-case slug (e.g. "cognizant-ml")
  role: string;                   // Authentic role title (e.g. "Work Experience", "Team Lead")
  company: string;                // Organization name (e.g. "Cognizant", "BP", "HS2")
  location: string;               // Office or site location (e.g. "London, UK")
  period: string;                 // Chronological timeframe (e.g. "Sep 2025")
  description: string;            // Concise narrative sentence displayed on the main storyboard
  bulletPoints: string[];         // Granular accomplishments displayed in the full-page archive
  featured: boolean;              // true = displayed on main storyboard; false = archive only
  category: "work" | "competition"; // Distinction for filtering
}
```

---

### 4. `BlogItem` Schema (Research Dispatches & Working Papers)
Represents technical writing, dissertation extracts, and mathematical notes:

```typescript
export interface BlogItem {
  id: string;                     // Unique kebab-case slug (e.g. "ai-in-warfare-epq")
  title: string;                  // Headline (e.g. "Autonomous Weaponry & Cyber Warfare: Strategic Invariants of AI")
  readTime: string;               // Estimated read duration (e.g. "12 min read")
  date: string;                   // Formal publication date (e.g. "December 2025")
  excerpt: string;                // Digest summary displayed on the main storyboard
  content: string;                // Complete markdown/text body rendered in top-slide reader view
  tags: string[];                 // Array of subject tags
  featured: boolean;              // true = displayed on main storyboard; false = archive only
}
```

---

### 5. `EducationItem` Schema
Represents formal academic credentials:

```typescript
export interface EducationItem {
  id: string;                     // Unique kebab-case slug (e.g. "upton-court")
  institution: string;            // School or institution name (e.g. "Upton Court Grammar School")
  program: string;                // Qualification title (e.g. "A-Levels: Computer Science, Mathematics, Further Mathematics")
  period: string;                 // Chronological timeframe (e.g. "Sep 2024 — Aug 2026")
  grades: string;                 // Formally verified results (e.g. "Achieved AAA")
  details: string[];              // Array of specializations, EPQ details, leadership roles
  featured: boolean;              // true = displayed on main storyboard; false = archive only
}
```

---

## 3. Reactive State Architecture & Storage Engine

All persistence operations are encapsulated inside `src/lib/cmsStore.ts`.

```
+-----------------------------------------------------------------------------------------+
|                                  LOCALSTORAGE LAYER                                     |
|  - cs_portfolio_settings    - cs_portfolio_projects    - cs_portfolio_experience        |
|  - cs_portfolio_education   - cs_portfolio_blogs                                        |
+-----------------------------------------------------------------------------------------+
                                           ▲
                                           │ Read / Write
                                           ▼
+-----------------------------------------------------------------------------------------+
|                              CMS STORE STATE MACHINE (cmsStore.ts)                      |
|  - Validates schemas                                                                    |
|  - Enforces display limits (e.g. max 3 featured items)                                  |
|  - Dispatches custom DOM event: window.dispatchEvent(new CustomEvent("cms-store-updated"))|
+-----------------------------------------------------------------------------------------+
                    │                                                  │
                    ▼ (Cross-tab sync via window "storage")            ▼ (Local DOM event)
+-------------------------------------------------------+  +------------------------------+
|                CMS STUDIO (/cms.html)                 |  |    LIVE PORTFOLIO (index.html)|
|  - Range slider limit controls                        |  |    - dynamicContent.ts       |
|  - Real-time indicator badges                         |  |    - Re-renders panels       |
|  - Modal add/edit forms                               |  |    - Updates "View All (N)"  |
+-------------------------------------------------------+  +------------------------------+
```

### Event Bus Mechanics:
When an item is modified in `cms.html`:
1. `cmsStore.saveProjects(updatedList)` updates `localStorage.setItem("cs_portfolio_projects", ...)`.
2. `cmsStore` immediately dispatches:
   ```typescript
   window.dispatchEvent(new CustomEvent("cms-store-updated"));
   ```
3. In `index.html`, `dynamicContent.ts` catches this event and selectively patches the DOM:
   ```typescript
   window.addEventListener("cms-store-updated", () => {
     renderDynamicContent();
   });
   ```
4. If the portfolio and CMS are open in separate browser windows or monitors, the native `window.addEventListener("storage", ...)` listener detects the cross-tab mutation and updates the storyboard automatically with zero manual refreshes required.

---

## 4. Display Upper Bounds & Storyboard Curation Logic

To ensure the portfolio adheres to **balanced minimalism**, the CMS enforces strict display thresholds:

```
[ TOTAL STORED ITEMS IN CATEGORY ]  (e.g., 6 projects)
                 │
                 ├─── Featured = TRUE  ──────► Capped by Limit (Max 3) ──► RENDER ON MAIN STORYBOARD
                 │                                                          (Panels 04, 05, 06)
                 │
                 └─── Featured = FALSE ──────► Preserved in Store ───────► RENDER IN FULL-PAGE ARCHIVE
                                                                            (#vertical-archive-view)
```

### The Indicator Counter Formula:
```typescript
const featuredCount = items.filter(i => i.featured).length;
const limit = settings.featuredProjectsLimit; // e.g. 3
const drawerCount = items.length - featuredCount;

// Renders: "Showing 3 of 3 allowed on main storyboard · 3 in extended drawer"
```

### Guardrail Behavior:
If a user attempts to mark a fourth item as featured when the limit is set to 3:
- The UI triggers an alert modal: `"Limit reached. You have already highlighted 3 items on the main storyboard. Please move an existing item to the drawer first, or increase your display limit in Settings."`
- This programmatic constraint prevents inadvertent clutter from degrading the storyboard's negative space.

---

## 5. JSON Migration & Resilience Format

The CMS supports exporting and importing the entire website state as a unified JSON payload (`audit/data/portfolio_data_dump.json`).

### Export Schema Format:
```json
{
  "version": "1.0",
  "exportedAt": "2026-11-05T02:10:00Z",
  "settings": { ... },
  "projects": [ ... ],
  "experience": [ ... ],
  "education": [ ... ],
  "blogs": [ ... ]
}
```

### Import Verification:
When a JSON file is uploaded via `cms.html`:
1. The parser verifies that top-level arrays exist for `projects`, `experience`, `education`, and `blogs`.
2. Validated entities are committed to `localStorage`.
3. The event bus fires `cms-store-updated`, instantly re-hydrating both the CMS and the live storyboard.
