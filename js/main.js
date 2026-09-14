(() => {
  "use strict";

  const CFG = Object.assign({
    email: "rvazqu10@calpoly.edu",
    web3formsKey: "",
    calendlyUrl: "",
    hourlyRate: 15,
    trialMinutes: 30,
    paymentMethods: "",
    githubUrl: ""
  }, window.SITE_CONFIG || {});

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const money = (n) => "$" + n.toFixed(2);

  /* ---------- Config → page ---------- */
  $$("[data-config-email]").forEach((a) => { a.href = "mailto:" + CFG.email; a.textContent = CFG.email; });
  $$("[data-config-rate]").forEach((el) => { el.textContent = CFG.hourlyRate; });
  $$("[data-config-trial]").forEach((el) => { el.textContent = CFG.trialMinutes; });
  if (CFG.paymentMethods) {
    $$("[data-config-pay]").forEach((el) => { el.textContent = CFG.paymentMethods; });
    $$(".pay-line, .pay-inline").forEach((el) => { el.hidden = false; });
  }
  if (CFG.githubUrl) {
    $$("[data-config-github]").forEach((a) => { a.href = CFG.githubUrl; });
    $$(".gh-link").forEach((el) => { el.hidden = false; });
  }
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Loader ---------- */
  const finishLoad = () => {
    document.body.classList.remove("is-loading");
    document.body.classList.add("loaded");
  };
  if (reduced) {
    finishLoad();
  } else {
    const counters = $$(".loader [data-count]");
    const start = performance.now();
    const dur = 700;
    const tick = (now) => {
      const t = clamp((now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      counters.forEach((c) => { c.textContent = (Number(c.dataset.count) * e).toFixed(2); });
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    const ready = new Promise((res) => (document.readyState === "complete" ? res() : window.addEventListener("load", res, { once: true })));
    const minTime = new Promise((res) => setTimeout(res, 1350));
    const maxTime = new Promise((res) => setTimeout(res, 3000));
    Promise.race([Promise.all([ready, minTime]), maxTime]).then(finishLoad);
  }

  /* ---------- Split headings into masked words ---------- */
  $$("[data-split]").forEach((el) => {
    let i = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const wm = document.createElement("span");
            wm.className = "wm";
            const wi = document.createElement("span");
            wi.className = "wi";
            wi.style.setProperty("--i", i++);
            wi.textContent = part;
            wm.appendChild(wi);
            frag.appendChild(wm);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
  });

  /* ---------- Statement: words light up with scroll ---------- */
  const statement = $("[data-words]");
  let statementWords = [];
  if (statement) {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span");
            w.className = "w";
            w.textContent = part;
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(statement);
    statementWords = $$(".w", statement);
  }

  /* ---------- Reveal on view ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  const pendingReveal = new Set();
  $$("[data-reveal], [data-split]").forEach((el, idx) => {
    if (el.hasAttribute("data-reveal")) {
      const sibs = Array.from(el.parentElement.children).filter((c) => c.hasAttribute("data-reveal"));
      el.style.transitionDelay = Math.min(sibs.indexOf(el), 6) * 70 + "ms";
    }
    io.observe(el);
    pendingReveal.add(el);
  });
  // Fallback for browsers/tabs where IntersectionObserver fires late
  const revealCheck = (vh) => {
    if (!pendingReveal.size) return;
    pendingReveal.forEach((el) => {
      if (el.classList.contains("in")) { pendingReveal.delete(el); return; }
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.95 && r.bottom > 0) { el.classList.add("in"); pendingReveal.delete(el); }
    });
  };

  /* ---------- Menu ---------- */
  const menu = $("#menu");
  const menuBtn = $(".menu-btn");
  const setMenu = (open) => {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("is-open")));
      setTimeout(() => $("a", menu).focus({ preventScroll: true }), 350);
    } else {
      menu.classList.remove("is-open");
      setTimeout(() => { if (!menu.classList.contains("is-open")) menu.hidden = true; }, reduced ? 0 : 800);
    }
  };
  menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) { setMenu(false); menuBtn.focus(); }
  });

  /* ---------- Custom cursor + magnetic buttons ---------- */
  if (finePointer && !reduced) {
    const cursor = $(".cursor");
    let mx = -100, my = -100, cx = -100, cy = -100;
    window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));
    document.addEventListener("pointerenter", () => cursor.classList.remove("is-hidden"));
    const hoverSel = "a, button, summary, .chip, input, select, textarea, .card";
    document.addEventListener("pointerover", (e) => { if (e.target.closest(hoverSel)) cursor.classList.add("is-hover"); });
    document.addEventListener("pointerout", (e) => { if (e.target.closest(hoverSel)) cursor.classList.remove("is-hover"); });
    const loop = () => {
      cx = lerp(cx, mx, 0.22); cy = lerp(cy, my, 0.22);
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();

    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform .6s cubic-bezier(.2,.7,.1,1), color .4s";
        el.style.transform = "";
        setTimeout(() => { el.style.transition = ""; }, 600);
      });
    });

    // Portrait tilt toward the pointer
    const portrait = $("[data-tilt]");
    if (portrait) {
      window.addEventListener("pointermove", (e) => {
        const rx = (e.clientY / innerHeight - 0.5) * -6;
        const ry = (e.clientX / innerWidth - 0.5) * 8;
        portrait.style.setProperty("--rx", rx + "deg");
        portrait.style.setProperty("--ry", ry + "deg");
      }, { passive: true });
    }
  }

  /* ---------- Scroll-driven motion ---------- */
  const nav = $(".nav");
  const progress = $(".progress");
  const hero = $(".hero");
  const heroLines = $$("[data-hero-x]");
  const portrait = $(".portrait");
  const themed = $$("[data-bg]").filter((el) => el !== document.body);
  const collage = $(".collage");
  const cards = $$("[data-speed]");
  const how = $(".how");
  const howTrack = $(".how-track");
  const howMeter = $(".how-meter");
  const marquees = $$(".marquee").map((m) => ({
    el: m, track: $(".marquee-track", m), dir: Number(m.dataset.dir) || -1, x: 0, w: 0
  }));
  const wideHow = window.matchMedia("(min-width: 901px)");
  const wideCollage = window.matchMedia("(min-width: 1001px)");

  // Duplicate marquee content for a seamless loop
  marquees.forEach((m) => {
    const html = m.track.innerHTML;
    m.track.innerHTML = html + html + html;
    m.track.querySelectorAll("*").forEach((n, i) => { if (i >= m.track.children.length / 3) n.setAttribute("aria-hidden", "true"); });
  });
  const measureMarquees = () => marquees.forEach((m) => { m.w = m.track.scrollWidth / 3; });
  measureMarquees();
  window.addEventListener("resize", measureMarquees);
  document.fonts && document.fonts.ready.then(measureMarquees);

  let lastY = window.scrollY;
  let velocity = 0;
  let smoothY = window.scrollY;
  let lastTheme = "paper";
  let frameCount = 0;

  const frame = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    const delta = y - lastY;
    lastY = y;
    velocity = lerp(velocity, delta, 0.1);
    smoothY = lerp(smoothY, y, 0.14);

    if (frameCount++ % 6 === 0) revealCheck(vh);

    // progress bar
    const max = document.documentElement.scrollHeight - vh;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    // hide nav on scroll down
    if (!document.body.classList.contains("menu-open")) {
      nav.classList.toggle("is-hidden", delta > 2 && y > vh * 0.6);
      if (delta < -2) nav.classList.remove("is-hidden");
    }

    // background theme follows the section under the middle of the screen
    const mid = vh * 0.5;
    for (const sec of themed) {
      const r = sec.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) {
        const t = sec.dataset.bg;
        if (t !== lastTheme) { document.body.dataset.bg = t; lastTheme = t; }
        break;
      }
    }

    if (!reduced) {
      // hero: name lines slide apart, portrait sinks slower, ledger lines drift
      if (hero) {
        const hp = clamp(smoothY / vh, 0, 1.2);
        heroLines.forEach((l) => { l.style.transform = `translate3d(${Number(l.dataset.heroX) * hp * 18}vw, 0, 0)`; });
        if (portrait) {
          portrait.style.transform = `translate3d(0, ${hp * 90}px, 0) perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(${1 - hp * 0.08})`;
        }
        hero.style.setProperty("--ledger-y", `${-smoothY * 0.25}px`);
      }

      // marquee speed reacts to scroll velocity
      marquees.forEach((m) => {
        const speed = 0.9 + Math.min(Math.abs(velocity) * 0.35, 18);
        const dir = m.dir * (velocity < -0.5 ? -1 : 1);
        m.x += speed * dir;
        if (m.w) {
          if (m.x <= -m.w) m.x += m.w;
          if (m.x > 0) m.x -= m.w;
        }
        m.track.style.transform = `translate3d(${m.x}px, 0, 0)`;
      });

      // collage parallax
      if (collage && wideCollage.matches) {
        const r = collage.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const off = r.top + r.height / 2 - vh / 2;
          cards.forEach((c) => {
            const rot = c.classList.contains("c2") ? " rotate(-3deg)" : "";
            c.style.transform = `translate3d(0, ${off * Number(c.dataset.speed)}px, 0)${rot}`;
          });
        }
      }

      // horizontal steps
      if (how && wideHow.matches) {
        const r = how.getBoundingClientRect();
        const p = clamp(-r.top / (r.height - vh));
        const dist = howTrack.scrollWidth - window.innerWidth;
        howTrack.style.transform = `translate3d(${-p * dist}px, 0, 0)`;
        howMeter.style.setProperty("--p", p.toFixed(4));
      }
    }

    // statement words
    if (statement && statementWords.length) {
      if (reduced) {
        statementWords.forEach((w) => w.classList.add("on"));
      } else {
        const r = statement.getBoundingClientRect();
        const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.25));
        const lit = Math.round(p * statementWords.length * 1.1);
        statementWords.forEach((w, i) => w.classList.toggle("on", i < lit));
      }
    }

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  /* ---------- Request form + live quote ---------- */
  const form = $("#request-form");
  if (form) {
    const q = {
      name: $("#q-name"), course: $("#q-course"), help: $("#q-help"), format: $("#q-format"),
      hours: $("#q-hours"), sub: $("#q-sub"), total: $("#q-total"), date: $("#q-date")
    };
    q.date.textContent = new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });

    const bump = (el) => { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); };
    let lastTotal = "";

    const readForm = () => {
      const fd = new FormData(form);
      return {
        name: (fd.get("name") || "").trim(),
        email: (fd.get("email") || "").trim(),
        phone: (fd.get("phone") || "").trim(),
        year: fd.get("year") || "",
        course: (fd.get("course") || "").trim(),
        professor: (fd.get("professor") || "").trim(),
        help: fd.getAll("help_with"),
        next_exam: fd.get("next_exam") || "",
        format: fd.get("format") || "Either works",
        hours: Number(fd.get("hours_per_week") || 0),
        availability: (fd.get("availability") || "").trim(),
        message: (fd.get("message") || "").trim(),
        botcheck: fd.get("botcheck")
      };
    };

    const updateQuote = () => {
      const d = readForm();
      q.name.textContent = d.name || "Your name";
      q.name.classList.toggle("is-empty", !d.name);
      q.course.textContent = d.course || "—";
      q.help.textContent = d.help.length ? d.help.join(", ") : "—";
      q.format.textContent = d.format;
      const weekly = d.hours * CFG.hourlyRate;
      q.hours.textContent = d.hours ? (d.hours >= 4 ? "4+ hrs" : d.hours + (d.hours === 1 ? " hr" : " hrs")) : "—";
      q.sub.textContent = d.hours ? money(weekly) + (d.hours >= 4 ? "+" : "") : "—";
      const total = money(weekly) + (d.hours >= 4 ? "+" : "");
      if (total !== lastTotal) { q.total.textContent = total; if (lastTotal) bump(q.total); lastTotal = total; }
      return d;
    };
    form.addEventListener("input", updateQuote);
    form.addEventListener("change", updateQuote);
    updateQuote();

    const setErr = (id, msg) => {
      const field = $("#f-" + id).closest(".field");
      $("#e-" + id).textContent = msg || "";
      field.classList.toggle("has-err", !!msg);
      $("#f-" + id).setAttribute("aria-invalid", msg ? "true" : "false");
      if (msg) $("#f-" + id).setAttribute("aria-describedby", "e-" + id);
    };
    const validate = (d) => {
      let first = null;
      const check = (id, ok, msg) => { setErr(id, ok ? "" : msg); if (!ok && !first) first = id; };
      check("name", d.name.length > 1, "Enter your name.");
      check("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email), "Enter a valid email so I can reply.");
      check("course", d.course.length > 1, "Tell me which class you need help with.");
      if (first) $("#f-" + first).focus();
      return !first;
    };
    ["name", "email", "course"].forEach((id) => $("#f-" + id).addEventListener("blur", () => {
      if ($("#f-" + id).closest(".field").classList.contains("has-err")) validate(readForm());
    }));

    const status = $(".form-status", form);
    const submitBtn = $("button[type=submit]", form);
    const btnLabel = $(".btn-label", submitBtn);

    const summaryText = (d) => [
      `Name: ${d.name}`, `Email: ${d.email}`, d.phone && `Phone: ${d.phone}`, d.year && `Year: ${d.year}`,
      `Class: ${d.course}`, d.professor && `Professor: ${d.professor}`,
      `Help with: ${d.help.join(", ") || "Not specified"}`, d.next_exam && `Next exam: ${d.next_exam}`,
      `Format: ${d.format}`, `Hours per week: ${d.hours ? (d.hours >= 4 ? "4+" : d.hours) : "Not sure yet"}`,
      d.availability && `Availability: ${d.availability}`, d.message && `\nMessage:\n${d.message}`
    ].filter(Boolean).join("\n");

    const showSuccess = (d, viaEmail) => {
      const box = document.createElement("div");
      box.className = "success";
      box.setAttribute("tabindex", "-1");
      box.innerHTML = `
        <p class="hand">Got it${d.name ? ", " + escapeHtml(d.name.split(" ")[0]) : ""}.</p>
        <h3>${viaEmail ? "Finish sending in your email app" : "Request sent"}</h3>
        <p>${viaEmail
          ? "Your email app should have opened with your request filled in. Press send there and I’ll reply to schedule your free session."
          : "I’ll email you at <strong>" + escapeHtml(d.email) + "</strong> to schedule your free 30-minute session."}</p>
        <button class="btn btn-hi" type="button"><span>Send another request</span></button>`;
      form.hidden = true;
      form.after(box);
      box.focus();
      $("button", box).addEventListener("click", () => { box.remove(); form.reset(); updateQuote(); form.hidden = false; $("#f-name").focus(); });
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const d = readForm();
      status.textContent = ""; status.classList.remove("is-err");
      if (d.botcheck) return;
      if (!validate(d)) { status.textContent = "Check the highlighted fields."; status.classList.add("is-err"); return; }

      const keySet = CFG.web3formsKey && !/YOUR_/.test(CFG.web3formsKey);
      if (!keySet) {
        const subject = encodeURIComponent(`Tutoring request: ${d.course}`);
        const body = encodeURIComponent(summaryText(d));
        window.location.href = `mailto:${CFG.email}?subject=${subject}&body=${body}`;
        showSuccess(d, true);
        return;
      }

      submitBtn.disabled = true;
      btnLabel.textContent = "Sending…";
      try {
        const payload = {
          access_key: CFG.web3formsKey,
          subject: `New tutoring request: ${d.name} · ${d.course}`,
          from_name: "Roberto Vazquez Tutoring website",
          replyto: d.email,
          name: d.name, email: d.email, phone: d.phone || "—", year: d.year || "—",
          class: d.course, professor: d.professor || "—",
          help_with: d.help.join(", ") || "Not specified",
          next_exam: d.next_exam || "—", format: d.format,
          hours_per_week: d.hours ? (d.hours >= 4 ? "4+" : String(d.hours)) : "Not sure yet",
          estimated_weekly: money(d.hours * CFG.hourlyRate),
          availability: d.availability || "—", message: d.message || "—",
          botcheck: ""
        };
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload)
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new Error(json.message || "Request failed");
        showSuccess(d, false);
      } catch (err) {
        status.innerHTML = `Your request didn’t send. Try again, or email <a href="mailto:${CFG.email}">${CFG.email}</a>.`;
        status.classList.add("is-err");
      } finally {
        submitBtn.disabled = false;
        btnLabel.textContent = "Send request";
      }
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ---------- Calendly (lazy) ---------- */
  const slot = $("#calendly-slot");
  if (slot && /^https:\/\/calendly\.com\//.test(CFG.calendlyUrl)) {
    const lazy = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      lazy.disconnect();
      const url = new URL(CFG.calendlyUrl);
      url.searchParams.set("hide_gdpr_banner", "1");
      url.searchParams.set("background_color", "ffffff");
      url.searchParams.set("text_color", "0e1a33");
      url.searchParams.set("primary_color", "0e1a33");
      slot.innerHTML = `<div class="calendly-inline-widget" data-url="${url.toString()}"></div>`;
      const s = document.createElement("script");
      s.src = "https://assets.calendly.com/assets/external/widget.js";
      s.async = true;
      document.body.appendChild(s);
    }, { rootMargin: "400px" });
    lazy.observe(slot);
  }
})();
