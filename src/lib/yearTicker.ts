import gsap from "gsap";

export interface YearTickerOptions {
  startYear?: number;
  endYear?: number;
  onComplete?: () => void;
}

export function initYearTicker(options: YearTickerOptions = {}) {
  const {
    startYear = 2021,
    endYear = 2026,
    onComplete = () => {},
  } = options;

  const section = document.querySelector<HTMLElement>("[data-section='hero']");
  const yearStrip = document.querySelector<HTMLElement>("[data-year-strip]");
  const yearRow = document.querySelector<HTMLElement>("[data-year-row]");

  if (!section || !yearStrip || !yearRow) {
    onComplete();
    return () => {};
  }

  const delta = Math.max(0, endYear - startYear);
  const getCellHeight = () => 32; // Exactly 32px (h-8) per milestone

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete,
  });

  // Roll Year Strip smoothly to 2026
  tl.to(yearStrip, {
    y: () => -delta * getCellHeight(),
    duration: 2.2,
    ease: "power4.inOut",
  });

  return () => {
    tl.kill();
  };
}
