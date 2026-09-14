(() => {
  "use strict";
  const reader = document.getElementById("reader");
  if (!reader) return;
  const body = reader.querySelector(".reader-body");
  const cards = Array.from(document.querySelectorAll(".ex-card"));
  let index = 0;
  let opener = null;

  const show = (i) => {
    index = (i + cards.length) % cards.length;
    const doc = cards[index].querySelector(".doc").cloneNode(true);
    body.replaceChildren(doc);
    body.scrollTop = 0;
    reader.setAttribute("aria-label", cards[index].querySelector(".h3").textContent);
  };

  cards.forEach((card, i) => card.addEventListener("click", () => {
    opener = card;
    show(i);
    if (typeof reader.showModal === "function") reader.showModal();
    else reader.setAttribute("open", "");
    document.body.style.overflow = "hidden";
  }));

  reader.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => show(index + Number(b.dataset.step))));
  reader.querySelector("[data-close]").addEventListener("click", () => reader.close());
  reader.addEventListener("click", (e) => { if (e.target === reader) reader.close(); });
  reader.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") show(index + 1);
    if (e.key === "ArrowLeft") show(index - 1);
  });
  reader.addEventListener("close", () => {
    document.body.style.overflow = "";
    if (opener) opener.focus();
  });
})();
