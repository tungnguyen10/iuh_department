export function initInfrastructure() {
  const infrastructureCards = document.querySelectorAll(".infrastructure-card");

  if (infrastructureCards.length === 0) return;

  infrastructureCards.forEach((card) => {
    const linkElement = card.querySelector("a[href]");

    if (linkElement) {
      const href = linkElement.getAttribute("href");
      if (!href || href === "" || href === "#" || href === "undefined") {
        linkElement.style.display = "none";
        card.style.cursor = "default";
      }
    }

    const img = card.querySelector("img");
    if (!img) return;

    img.style.opacity = "0";
    img.style.transition = "opacity 500ms ease-in-out";

    if (img.complete) {
      img.style.opacity = "1";
    } else {
      img.addEventListener("load", () => {
        img.style.opacity = "1";
      });
      img.addEventListener("error", () => {
        img.style.opacity = "1";
      });
    }
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("infrastructure-card--visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    infrastructureCards.forEach((card) => observer.observe(card));
  }
}

export default { initInfrastructure };
