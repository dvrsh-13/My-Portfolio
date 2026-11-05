# Technical Dossier: Reverse Engineering khanhnguyen.design

**Reference Website:** [https://khanhnguyen.design/](https://khanhnguyen.design/)  
**Honors:** Awwwards Site of the Year Nominee, CSS Design Awards, Landing Gallery Feature  
**Analysis Engine:** Reverse-Engineer-Anything (REA) Framework & Headless CDP Inspection  
**Audit Target:** Architecture, Motion Physics, Spatial Mathematics, and Anti-Slop Principles  

---

## 1. Executive Summary & Aesthetic Deconstruction

[khanhnguyen.design](https://khanhnguyen.design/) is the portfolio of Khanh Nguyen, an independent product designer based in Saigon, Vietnam. It is widely regarded in the creative web design community as a masterpiece of modern web development. Unlike typical agency or SaaS websites that rely on off-the-shelf templates, it functions as a **precision-engineered architectural machine**: calm, disciplined, mathematically coherent, tactile, and restrained.

When evaluated from the perspective of an engineer with a background in **Computer Science and Applied Mathematics**, the site's appeal lies not in decorative ornamentation, but in its rigorous structural formalism:
1. **Coordinate Geometry as Layout:** Every element's position and scale is derived from a unified fluid unit rather than arbitrary pixel values.
2. **Deterministic State Transitions:** Motion is deterministic and tied strictly to scroll velocity and progress rather than disconnected autonomous spring loops.
3. **Restraint and Negative Space:** Content is given immense breathing room; sections are paced like chapters in a book rather than an endless scrolling billboard.

---

## 2. Technical Stack Deconstruction (Static & Runtime Inspection)

Passive CDP inspection, network capture, and DOM analysis yielded the following stack blueprint of the reference site:

```
+-----------------------------------------------------------------------------------------+
| PRESENTATION LAYER: Astro v6.3.1 (Static HTML Generation + Zero-JS Island Defaults)     |
| STYLING ENGINE:     Tailwind CSS (Custom Utility Extension with Proportional Ratios)   |
| MOTION ENGINE:      GSAP (GreenSock) v3.12 + ScrollTrigger Plugin                       |
| VIRTUAL SCROLL:     Lenis v1.1 (Momentum-Decoupled Wheel Traversal)                     |
| TYPOGRAPHIC PAIR:   PP Editorial Old (High-Contrast Serif) + PP Neue Montreal (Sans)    |
| HOSTING / CDN:      Cloudflare Pages (Edge Cached Global Assets)                        |
+-----------------------------------------------------------------------------------------+
```

### Key Technical Findings from Network Payloads:
- **Zero Framework Runtime Overhead:** The reference site avoids React, Vue, or Angular runtimes for its core page delivery, outputting clean semantic HTML via Astro.
- **Scroll Restoration Override:** Line 2 of `page.html` immediately locks native history scroll:
  ```javascript
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }
  window.scrollTo(0, 0);
  ```
  This is essential for pinned horizontal layouts; native browser scroll restoration causes catastrophic coordinate disorientation upon page refresh.
- **Asset Weight Discipline:** The total JavaScript footprint is tightly scoped (< 160 kB gzipped), with zero third-party tracking scripts or bloatware.

---

## 3. The Core Mathematical Architecture: Fluid Scale Engine (`--scale`)

The single most consequential structural discovery of this reverse engineering effort is the **Continuous Proportional Scaling Unit (`--scale`)**.

### The Problem with Discrete Breakpoints
Mainstream frontend workflows rely on Tailwind's discrete breakpoints:
$$\text{sm: } 640\text{px}, \quad \text{md: } 768\text{px}, \quad \text{lg: } 1024\text{px}, \quad \text{xl: } 1280\text{px}, \quad \text{2xl: } 1536\text{px}$$
Between these arbitrary thresholds, layouts stretch, compress, wrap text unevenly, and create visual awkwardness. On ultrawide displays (e.g. 3440×1440) or compact laptops (e.g. 13-inch MacBook 1280×800), standard breakpoint layouts frequently collapse or float aimlessly.

### The Mathematical Solution: Viewport-Proportional Baseline
Instead of fixed pixels or rems, all spatial metrics are derived from continuous viewport division:

$$\text{--scale}_{\text{desktop}} = \frac{100\text{vw}}{144} \quad (\approx 1\text{unit} = 10\text{px on a standard 1440px desktop})$$
$$\text{--scale}_{\text{mobile}} = \frac{100\text{vw}}{39} \quad (\approx 1\text{unit} = 10\text{px on a standard 390px mobile viewport})$$

In CSS (`src/styles/tokens.css`):
```css
:root {
  /* Mobile: 390px artboard */
  --scale: calc(100vw / 39);
}

@media (min-width: 768px) {
  :root {
    /* Desktop: 1440px artboard */
    --scale: calc(100vw / 144);
  }
}
```

### Proportional Token Matrix
Every structural dimension across the application derives strictly from this scaling factor:

| Token Name | Formula | Value at 1440px (Desktop) | Value at 1920px (1080p Fullscreen) | Value at 390px (Mobile) | Functional Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--vg` | `calc(4.8 * var(--scale))` | `48.0px` | `64.0px` | `18.7px` | Master Vertical Gutter / Margin |
| `--display-fs` | `calc(3.2 * var(--scale))` | `32.0px` | `42.6px` | `24.0px` | Chapter titles & secondary leads |
| `--list-fs` | `calc(6.4 * var(--scale))` | `64.0px` | `85.3px` | `38.0px` | Interactive work list font size |
| `--name-fs` | `calc(7.8 * var(--scale))` | `78.0px` | `104.0px` | `54.0px` | Monumental serif display headline |
| `--year-slot` | `calc(7.4 * var(--scale))` | `74.0px` | `98.6px` | `48.0px` | Year ticker viewport slot height |
| `--cta-fs` | `calc(2.3 * var(--scale))` | `23.0px` | `30.6px` | `18.0px` | Interactive navigation links |
| `--portrait-w`| `calc(29.4 * var(--scale))` | `294.0px` | `392.0px` | Full width | Blueprint / Media card width |
| `--portrait-h`| `calc(39.2 * var(--scale))` | `392.0px` | `522.6px` | Aspect auto | Blueprint / Media card height |

**Mathematical Guarantee:** The ratio between any two visual elements $\frac{E_1}{E_2}$ is invariant across all screen sizes. An ultrawide monitor simply sees a majestically scaled, geometrically identical composition with zero reflow glitches.

---

## 4. Motion Physics & Dual-Axis Scroll Transformation

The fluid feel of the reference site is achieved by marrying **Lenis** (momentum virtual scroll decoupling) with **GSAP ScrollTrigger** using exponential deceleration curves.

### 1. Dual-Axis Coordinate Mapping
```
DESKTOP (>= 768px):
+----------------------------------------------------------------------------------------+
| Pinned Viewport (100dvh)                                                               |
| Native window.scrollY  ==============================>  GSAP track.translateX (-X px)  |
| Vertical Wheel Delta                                    Horizontal Storyboard Travel   |
+----------------------------------------------------------------------------------------+

MOBILE (< 768px):
+----------------------------------------------------------------------------------------+
| Unpinned Native Viewport                                                               |
| Native window.scrollY  ==============================>  Vertical Stacked Stream (Y px) |
| Standard Touch Swipe                                    Natural Block Flow             |
+----------------------------------------------------------------------------------------+
```

### 2. Lenis Momentum Configuration
Rather than using standard linear momentum or bouncy spring physics, Lenis is initialized with an exponential decay curve:

```typescript
new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
  orientation: "vertical",
  gestureOrientation: "vertical",
  smoothWheel: true,
  wheelMultiplier: 1.0,
  touchMultiplier: 1.5,
});
```

### 3. Pinned Midpoint Pause & Expansion Mechanism ("The Work" / "The Systems")
In standard horizontal scrolling, the camera sweeps continuously from left to right. In `khanhnguyen.design`, the track performs a theatrical **pause and split**:

```
PHASE 1: GLIDE IN                   PHASE 2: PINNED EXPANSION            PHASE 3: UNPIN & RESUME
[Panel 01] -> [Center Panel]        Center Panel Locked at Mid-Screen    Track resumes horizontal
Track moves -X px                   Media scales: 0.1 -> 1.0 (Full Cover) translation to Panel 04
                                    "THE" translates left (-150px)
                                    "SYSTEMS" translates right (+150px)
```

The mathematical geometry of this timeline (`src/lib/horizontalTrack.ts`):
```typescript
const phase1Dist = centerOffset; // Distance to center panel
const zoomDuration = window.innerWidth * 1.5; // Virtual scroll distance held in place
const phase3Dist = totalTrackWidth - centerOffset - window.innerWidth;
const totalScroll = phase1Dist + zoomDuration + phase3Dist;
```
During `zoomDuration`, `track.translateX` is frozen while child elements animate. When calculating navigation jumps (e.g. clicking `#projects`), the jump function must calculate whether the target is before or after `phase1Dist` and add `zoomDuration` to the scroll position accordingly.

### 4. Directional Kinetic Underlines
Links on `khanhnguyen.design` do not use `text-decoration: underline` or simple opacity transitions. They use CSS `::after` lines that "draw through" along the cursor's velocity vector:

```css
.to-link-underline::after {
  content: "";
  position: absolute;
  bottom: 0px;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: currentColor;
  transform-origin: 100% 50%;
  transform: scaleX(0);
  transition: transform 0.4s cubic-bezier(0.21, 0, 0.32, 1);
}

.to-link-underline:hover::after {
  transform-origin: 0% 50%;
  transform: scaleX(1);
}
```
* **Mouse Enter:** Line grows from left ($0\%$) to right ($100\%$).
* **Mouse Exit:** Line collapses towards the right ($100\%$), creating the visual sensation of momentum passing through the link.

### 5. Dynamic Rail Theme Synchronization
A fixed vertical rail (64px wide on desktop) sits pinned at `x = 0, y = 0, height = 100vh`. As panels with alternating background colors scroll beneath it, the rail must dynamically swap its color tokens to prevent becoming invisible:

```typescript
export function updateRailTheme() {
  if (!headerElement || !panelElements.length) return;
  const midViewport = window.innerWidth * 0.45; // Sampling coordinate

  for (const panel of panelElements) {
    const rect = panel.getBoundingClientRect();
    if (rect.left <= midViewport && rect.right >= midViewport) {
      const bg = panel.dataset.headerBg || "#000000";
      const text = panel.dataset.headerText || "#ffffff";
      const border = panel.dataset.headerBorder || "#222222";

      headerElement.style.setProperty("--header-bg", bg);
      headerElement.style.setProperty("--header-text", text);
      headerElement.style.setProperty("--header-border", border);
      break;
    }
  }
}
```

---

## 5. Architectural Comparison: High Craft vs. "Vibecoded" Slop

A central requirement of this project is avoiding the visual and structural tropes commonly generated by AI coding assistants (frequently termed "AI slop" or "vibecoding"):

| Dimension | "Vibecoded" AI Template Archetype | Architectural Standard (Our System) |
| :--- | :--- | :--- |
| **Color System** | Dark navy (`#0f172a`) with electric purple/cyan gradients and neon glow | Disciplined high-contrast monochromatic greyscale: Obsidian (`#000000`, `#080808`), Alabaster (`#ffffff`), and Hairline Slate (`#222222`) |
| **Spatial Scaling** | Hardcoded Tailwind utility classes (`p-4`, `m-6`, `gap-8`) breaking on non-standard viewports | Continuous fluid proportional scale (`--scale = 100vw / 144`) preserving geometric ratios everywhere |
| **Typography** | Inter or Roboto used everywhere; bold sans headlines with weak typographic hierarchy | High-contrast pairing: Light Editorial Serif (`Newsreader`) for monumental leads + Swiss Sans (`Plus Jakarta Sans`) for body |
| **Monospace Usage**| Monospace font applied lazily to general copy to look "technical" | Monospace (`JetBrains Mono`) strictly reserved for dates, quantitative metrics, code blocks, and clock |
| **Component Containers** | Every piece of data wrapped in a rounded grey box (`bg-neutral-900 border border-neutral-800 rounded-lg p-6 shadow-xl`) | Open typographic grids with delicate hairline dividers; content breathes naturally in negative space |
| **Badges & Tags** | Ubiquitous rounded pill buttons (`px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-xs`) | Quiet, inline typographic metadata (`Python · NumPy · Deflated Sharpe Ratio`) with zero pill containers |
| **Modal Design** | Generic right-hand drawers squeezing content into 40% of the screen with a giant dark backdrop | Full-page vertical editorial views (`max-w-4xl`) with smooth Y-axis transitions and ample centered margins |
| **Motion Physics** | Disconnected Framer Motion springs (`type: "spring", stiffness: 300`) with bouncy cartoon recoil | Pinned GSAP timelines with exponential deceleration (`power4.inOut`, `cubic-bezier(0.22, 1, 0.36, 1)`) |
| **Code Presentation**| Raw `<pre><code>` with horizontal clipping scrollbars and messy wrapping | Pre-formatted mathematical definition cards with syntax discipline and clean horizontal margins |

---

## 6. Portfolio Adaptation Strategy: CS & Applied Mathematics

The reference site was designed for a visual product designer. Recreating it for **Dev Patel** (Applied Mathematics & Computer Science candidate) required adapting its artistic rhythm to reflect mathematical rigor:

1. **Chapter 00 (Initialization / Hero):** Stripped timeline tickers and generic status tags. In their place: monumental editorial typography (`DEV PATEL`), a quiet subtitle (`Applied Mathematics & Computer Science`), a real-time Greenwich/London UTC clock, and coordinate tags.
2. **Chapter 01 (Profile & Focus):** Removed dossier boxes. Introduced a spacious 3-discipline breakdown: *Applied Mathematics* (stochastic processes, Fourier analysis), *Software Engineering* (systems, Linux, containerization), and *Data & Predictive Modelling* (gradient boosting, Monte Carlo).
3. **Chapter 02 (Academic Record):** Unboxed Upton Court A-Levels (AAA Achieved inline), Cambridge STEM Smart, and De Salis GCSEs. Integrated math modelling competitions (M3 Challenge Top 20%, Lockheed Martin Code Quest podium).
4. **Chapter 03 (Work Experience):** Highlighted placements at BP, Cognizant, Lockheed Martin, and High Speed Two (HS2).
5. **Chapter 04 (Computational Projects):** Feature studies on Backtest Overfitting (Deflated Sharpe Ratio) and Fourier Transform market noise filtering.
6. **Chapter 05 (Research Notes / Essays):** Dedicated reading room for working papers (e.g. algorithmic verification of autonomous systems, statistical deflation of backtests).
7. **Chapter 06 (Direct Channels):** High-contrast closing panel with direct email, GitHub, and LinkedIn channels.
