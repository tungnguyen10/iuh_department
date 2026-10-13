export function initConsultingReveal() {
  const targets = document.querySelectorAll("#consulting [data-reveal]");
  if (
    !targets.length ||
    typeof IntersectionObserver === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  targets.forEach((target) => {
    // Hide only once JS can guarantee the reveal, so no-JS keeps the content visible.
    target.classList.add("is-armed");
    observer.observe(target);
  });
}
