# Mathematical & Systems Architecture Portfolio
*A bespoke portfolio reverse-engineered from [khanhnguyen.design](https://khanhnguyen.design/) tailored for Computer Science & Applied Mathematics.*

---

## 1. Architectural Principles

This codebase is deliberately constructed to avoid "vibecoded" tropes (arbitrary Tailwind margins, uncalibrated spring physics, generic Inter fonts, and ungrounded drop shadows). Instead, it implements a disciplined mathematical and mechanical design system:

1. **Fluid Scaling Engine (`--scale`)**:
   - Desktop ($\ge 768\text{px}$): `--scale: calc(100vw / 144)` (based on a 1440px canvas, where 1 unit = 10px).
   - Mobile ($< 768\text{px}$): `--scale: calc(100vw / 39)` (based on a 390px mobile canvas, where 1 unit = 10px).
   - All line heights, type scales, gutters (`--vg`), and bounding boxes derive strictly from this unit, guaranteeing proportional geometry across any screen resolution.

2. **Dual-Axis Continuous Storyboard**:
   - **Desktop**: Pinned horizontal virtual scroll powered by **Lenis** + **GSAP ScrollTrigger**, translating vertical wheel input into smooth horizontal traversal.
   - **Midpoint Cinematic Pause ("The Systems")**: The track halts at the midpoint, smoothly scales an architectural benchmark card from `scale(0)` to full view, and splits the display typography outwards along the X-axis before handing back scroll velocity.
   - **Mobile**: Seamlessly folds into a responsive, tactile vertical layout.

3. **Dynamic Fixed Rail Navigation**:
   - A permanent 64px vertical rail on the left on desktop containing:
     - Real-time scroll progress indicator line.
     - Brand mark / Sigma-Lambda monogram.
     - Rotated vertical text reading upwards (`SYSTEMS · DISCRETE MATH` and `FOLIO — ARCHITECTURE`).
     - Dynamic theme synchronization (`--header-bg`, `--header-text`, `--header-border`) transitioning per chapter.

4. **Typography Pairing**:
   - High-contrast editorial serif (`Newsreader` / `PP Editorial Old`) with discretionary ligatures and italics.
   - Disciplined neo-grotesque sans (`Plus Jakarta Sans` / `PP Neue Montreal`).
   - Tabular monospace (`JetBrains Mono` / `SF Mono`) for timestamps, proofs, coordinates, and chapter indices.

---

## 2. Chapter Structure

- **00. Initialization (Hero)**: Year strip ticker (`2018` $\to$ `2026`), real-time UTC/GMT clock, system status `[SYS.NORMAL]`, and name reveal.
- **01. Philosophy & Theory (About)**: First-principles systems engineering, state-machine replication proofs, Curry-Howard isomorphism, queueing theory, with interactive formula hover portals.
- **02. Academic Pedigree (Education)**: Degree in Computer Science & Applied Mathematics, graduate coursework, Putnam / ICPC honors.
- **03. The Systems (Transition)**: Cinematic expander and split-typography transition.
- **04. Engineering & Infrastructure (Experience)**: High-throughput lab research, quantitative trading matching engines, formal verification.
- **05. Selected Artifacts (Projects)**: Interactive project ledger (*Aether-Consensus*, *Kryo-VM*, *ZK-SNARK*, *Hyperion-Book*) with live architecture blueprints in a fixed geometric frame.
- **06. Technical Dispatches (Blog)**: Papers on monads & state machines, cache-oblivious B-trees, linearizability.
- **07. Terminal Dispatch (Contact)**: Direct RFC 5322 email with kinetic underline, copyable PGP fingerprint, and academic channels.

---

## 3. Getting Started

### Prerequisites
- Node.js $\ge 18$ (tested on v26)
- npm

### Development
```bash
npm run dev
```
Starts the local development server at `http://localhost:3000`.

### Production Build
```bash
npm run build
```
Typechecks and builds the optimized static bundle into `dist/`.

### Preview Build
```bash
npm run preview
```
Previews the production build locally.
