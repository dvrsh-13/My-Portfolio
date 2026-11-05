/**
 * Precision telemetry clock and status system
 */
export function initTelemetryClock(selector = "[data-telemetry-clock]", timeZone = "UTC") {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return () => {};

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const update = () => {
    const now = new Date();
    const timeStr = formatter.format(now);
    elements.forEach((el) => {
      el.textContent = timeStr;
    });
  };

  update();
  const timer = window.setInterval(update, 1000);

  return () => window.clearInterval(timer);
}
