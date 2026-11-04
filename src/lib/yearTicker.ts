import gsap from "gsap";
import { lockScroll } from "./smoothScroll";

export interface YearTickerOptions {
  startYear?: number;
  endYear?: number;
  onComplete?: () => void;
}

export function initYearTicker(options: YearTickerOptions = {}) {
  const {
    startYear = 2018,
    endYear = 2026,
    onComplete = () => {},
  } = options;

  const section = document.querySelector<HTMLElement>("[data-section='hero']");
  const yearStrip = document.querySelector<HTMLElement>("[data-year-strip]");
  const yearRow = document.querySelector<HTMLElement>("[data-year-row]");
  const nameRow = document.querySelector<HTMLElement>("[data-name-row]");
  const revealLines = document.querySelectorAll<HTMLElement>("[data-reveal-line]");
  const overlay = document.querySelector<HTMLElement>("[data-loading-base-overlay]");

  if (!section || !yearStrip || !yearRow) {
    onComplete();
    return () => {};
  }

  // Pre-lock virtual scroll during initial choreography
  lockScroll(true);

  const delta = Math.max(0, endYear - startYear);
  const cell = yearStrip.querySelector<HTMLElement>(".year-strip-cell");
  const cellHeight = cell ? cell.getBoundingClientRect().height : yearRow.offsetHeight;

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      lockScroll(false);
      onComplete();
    },
  });

  // Step 1: Base state
  gsap.set(yearRow, { opacity: 1 });
  if (nameRow) gsap.set(nameRow, { opacity: 0 });
  if (overlay) gsap.set(overlay, { scaleX: 0, transformOrigin: "0% 100%" });

  // Step 2: Roll Year Strip
  tl.to(yearStrip, {
    y: -delta * cellHeight,
    duration: 2.2,
    ease: "power4.inOut",
  });

  if (overlay) {
    tl.to(
      overlay,
      {
        scaleX: 1,
        duration: 2.2,
        ease: "power4.inOut",
      },
      "<"
    );
  }

  // Step 3: Slide Year Up & Reveal Name Row
  tl.to(
    yearRow,
    {
      y: -cellHeight * 1.5,
      opacity: 0,
      duration: 1.2,
      ease: "power4.inOut",
    },
    "-=0.4"
  );

  if (nameRow) {
    tl.to(
      nameRow,
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power4.out",
      },
      "<+=0.2"
    );
  }

  // Step 4: Stagger reveal remaining hero elements (telemetry, status, scroll prompt)
  if (revealLines.length) {
    tl.fromTo(
      revealLines,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
      },
      "-=0.6"
    );
  }

  return () => {
    tl.kill();
    lockScroll(false);
  };
}
