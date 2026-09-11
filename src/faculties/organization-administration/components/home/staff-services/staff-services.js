// Collapses the "Tôi cần..." services grid on mobile, revealing extra items behind a toggle.
const MOBILE_QUERY = "(max-width: 639px)";
const VISIBLE_ON_MOBILE = 4;

export function initStaffServices() {
  const grid = document.querySelector("[data-services-grid]");
  const toggle = document.querySelector("[data-services-toggle]");
  if (!grid || !toggle) return;

  const label = toggle.querySelector("[data-services-toggle-label]");
  const icon = toggle.querySelector("[data-services-toggle-icon]");
  const cards = Array.from(grid.children);
  const extras = cards.slice(VISIBLE_ON_MOBILE);
  if (extras.length === 0) {
    toggle.closest("div")?.classList.add("hidden");
    return;
  }

  const mql = window.matchMedia(MOBILE_QUERY);
  let expanded = false;

  const render = () => {
    const mobile = mql.matches;
    // On desktop the grid always shows every card; the toggle is mobile-only.
    const hideExtras = mobile && !expanded;
    extras.forEach((card) => card.classList.toggle("hidden", hideExtras));

    if (mobile) {
      toggle.setAttribute("aria-expanded", String(expanded));
      if (label) label.textContent = expanded ? "Thu gọn" : `Xem thêm ${extras.length} dịch vụ`;
      if (icon) icon.classList.toggle("-rotate-90", expanded);
      if (icon) icon.classList.toggle("rotate-90", !expanded);
    }
  };

  toggle.addEventListener("click", () => {
    expanded = !expanded;
    render();
  });

  mql.addEventListener("change", () => {
    expanded = false;
    render();
  });

  render();
}
