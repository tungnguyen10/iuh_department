export function initFieldsIndex() {
  const list = document.querySelector("[data-fields-index]");
  if (!list) return;

  if (
    typeof IntersectionObserver === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  // Hide only once JS can guarantee the reveal, so no-JS keeps the rows visible.
  list.classList.add("is-armed");

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          list.classList.add("is-visible");
          obs.disconnect();
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(list);
}
