(() => {
  "use strict";

  const CFG = Object.assign({
    email: "rvazqu10@calpoly.edu", hourlyRate: 15, trialMinutes: 30, paymentMethods: "", githubUrl: ""
  }, window.SITE_CONFIG || {});
  window.RV = { CFG };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Config → page ---------- */
  $$("[data-config-email]").forEach((a) => { a.href = "mailto:" + CFG.email; a.textContent = CFG.email; });
  $$("[data-config-rate]").forEach((el) => { el.textContent = CFG.hourlyRate; });
  if (CFG.paymentMethods) {
    $$("[data-config-pay]").forEach((el) => { el.textContent = CFG.paymentMethods; });
    $$(".pay-line, .pay-inline").forEach((el) => { el.hidden = false; });
  }
  if (CFG.githubUrl) {
    $$("[data-config-github]").forEach((a) => { a.href = CFG.githubUrl; });
    $$(".gh-link").forEach((el) => { el.hidden = false; });
  }
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Loader (first page of the visit only) ---------- */
  const loader = $(".loader");
  if (loader && !document.documentElement.classList.contains("no-loader")) {
    setTimeout(() => {
      loader.classList.add("is-done");
      try { sessionStorage.setItem("rv-seen", "1"); } catch (e) {}
    }, 1250);
  }

  /* ---------- Nav ---------- */
  const nav = $(".nav");
  const menuBtn = $(".menu-btn");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  menuBtn.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
  $$(".nav-links a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Reveal ---------- */
  const pending = new Set($$(".reveal"));
  const reveal = (el) => { el.classList.add("in"); pending.delete(el); };
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px", threshold: 0.1 })
    : null;
  pending.forEach((el) => (io ? io.observe(el) : reveal(el)));

  /* ---------- Pricing calculator ---------- */
  const calcOut = $("#calc-total");
  if (calcOut) {
    const update = () => {
      const h = Number(($("input[name=calc]:checked") || {}).value || 0);
      calcOut.textContent = "$" + h * CFG.hourlyRate;
      calcOut.classList.remove("bump"); void calcOut.offsetWidth; calcOut.classList.add("bump");
    };
    $$("input[name=calc]").forEach((i) => i.addEventListener("change", update));
    calcOut.textContent = "$" + 2 * CFG.hourlyRate;
  }

  /* ---------- Scroll-driven motion ---------- */
  const scene = $(".scene");
  const stage = scene && $(".stage", scene);
  const panel = scene && $(".panel", scene);
  const content = scene && $(".panel-content", scene);
  const shapes = $$("[data-float]");
  const wide = matchMedia("(min-width: 901px)");

  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    nav.classList.toggle("is-scrolled", y > 20 && !(scene && wide.matches && y < scene.offsetHeight - vh));

    pending.forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < vh * 0.94 && r.bottom > 0) reveal(el); });

    if (reduced) return;

    if (scene && wide.matches) {
      const p = clamp(y / (vh * 0.95));
      const e = ease(p);
      const w = Math.min(660, vw * 0.48);
      const h = Math.min(vh - 100, 800);
      const ix = ((vw - w) / 2) * e;
      const it = ((vh - h) / 2 + 30) * e;
      const ib = ((vh - h) / 2 - 30) * e;
      stage.style.setProperty("--ix", ix + "px");
      stage.style.setProperty("--it", it + "px");
      stage.style.setProperty("--ib", Math.max(ib, 0) + "px");
      stage.style.setProperty("--r", 24 * e + "px");
      stage.style.setProperty("--p", p.toFixed(3));
      const fit = Math.min(0.8, (h - 48) / content.offsetHeight, (w - 48) / content.offsetWidth);
      stage.style.setProperty("--s", (1 - (1 - fit) * e).toFixed(4));
      stage.style.setProperty("--o", ease(clamp((p - 0.3) / 0.6)).toFixed(3));
    } else if (scene) {
      ["--ix", "--it", "--ib", "--r", "--s", "--o", "--p"].forEach((k) => stage.style.removeProperty(k));
    }

    shapes.forEach((s) => {
      const r = s.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const off = r.top + r.height / 2 - vh / 2;
      const sp = Number(s.dataset.float);
      s.style.transform = `translate3d(0, ${off * sp}px, 0) rotate(${off * sp * 0.4}deg)`;
    });
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
