(() => {
  "use strict";
  const form = document.getElementById("request-form");
  if (!form) return;

  const CFG = (window.RV && window.RV.CFG) || window.SITE_CONFIG || { hourlyRate: 15, email: "rvazqu10@calpoly.edu" };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const steps = $$(".fstep", form);
  const bars = $$(".progress-steps li");
  const back = $("[data-back]", form);
  const next = $("[data-next]", form);
  const submit = $("[data-submit]", form);
  const status = $(".form-status", form);
  let current = 0;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + n;

  const read = () => {
    const fd = new FormData(form);
    const t = (k) => String(fd.get(k) || "").trim();
    return {
      name: t("name"), email: t("email"), phone: t("phone"), year: t("year"),
      course: t("course"), professor: t("professor"), help: fd.getAll("help_with"), next_exam: t("next_exam"),
      format: t("format") || "Either works", hours: Number(fd.get("hours_per_week") || 0),
      availability: t("availability"), message: t("message"), botcheck: fd.get("botcheck")
    };
  };
  const hoursLabel = (h) => (h ? (h >= 4 ? "4+ hrs" : h + (h === 1 ? " hr" : " hrs")) : "Not sure yet");

  /* ---------- Receipt ---------- */
  $("#r-date").textContent = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  let lastTotal = "";
  const updateReceipt = () => {
    const d = read();
    $("#r-name").textContent = d.name || "—";
    $("#r-course").textContent = d.course || "—";
    $("#r-format").textContent = d.format;
    $("#r-hours").textContent = d.hours ? hoursLabel(d.hours) : "—";
    const weekly = d.hours * CFG.hourlyRate;
    $("#r-sub").textContent = d.hours ? money(weekly) + (d.hours >= 4 ? "+" : "") : "—";
    const total = money(weekly) + (d.hours >= 4 ? "+" : "");
    const el = $("#r-total");
    if (total !== lastTotal) {
      el.textContent = total;
      if (lastTotal) { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }
      lastTotal = total;
    }
  };
  form.addEventListener("input", updateReceipt);
  form.addEventListener("change", updateReceipt);
  updateReceipt();

  /* ---------- Validation ---------- */
  const setErr = (id, msg) => {
    const input = $("#f-" + id);
    $("#e-" + id).textContent = msg || "";
    input.closest(".field").classList.toggle("has-err", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (msg) input.setAttribute("aria-describedby", "e-" + id); else input.removeAttribute("aria-describedby");
  };
  const rules = {
    0: [["name", (d) => d.name.length > 1, "Enter your name."],
        ["email", (d) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email), "Enter a valid email so I can reply."]],
    1: [["course", (d) => d.course.length > 1, "Tell me which class you need help with."]]
  };
  const validateStep = (i) => {
    const d = read();
    let first = null;
    (rules[i] || []).forEach(([id, ok, msg]) => {
      const good = ok(d);
      setErr(id, good ? "" : msg);
      if (!good && !first) first = id;
    });
    if (first) $("#f-" + first).focus();
    return !first;
  };
  ["name", "email", "course"].forEach((id) => $("#f-" + id).addEventListener("input", () => {
    if ($("#f-" + id).closest(".field").classList.contains("has-err")) setErr(id, "");
  }));

  /* ---------- Review ---------- */
  const buildReview = () => {
    const d = read();
    const rows = [
      ["Name", d.name, 0], ["Email", d.email, 0], d.phone && ["Phone", d.phone, 0], d.year && ["Year", d.year, 0],
      ["Class", d.course, 1], d.professor && ["Professor", d.professor, 1],
      ["Help with", d.help.join(", ") || "Not specified", 1], d.next_exam && ["Next exam", d.next_exam, 1],
      ["Format", d.format, 2], ["Hours per week", hoursLabel(d.hours), 2],
      d.availability && ["Availability", d.availability, 2], d.message && ["Message", d.message, 2],
      ["Estimated weekly cost", d.hours ? money(d.hours * CFG.hourlyRate) + (d.hours >= 4 ? "+" : "") + " after your free session" : "Free session first", null]
    ].filter(Boolean);
    $("#review").innerHTML = rows.map(([k, v, s]) =>
      `<div><dt>${esc(k)}${s !== null ? ` · <button type="button" class="edit-link" data-goto="${s}">Edit</button>` : ""}</dt><dd>${esc(v)}</dd></div>`
    ).join("");
    $$("[data-goto]", form).forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.goto))));
  };

  /* ---------- Step navigation ---------- */
  const go = (i) => {
    const dir = i > current ? "enter" : "enter-back";
    steps[current].hidden = true;
    current = i;
    const step = steps[current];
    step.hidden = false;
    step.classList.remove("enter", "enter-back"); void step.offsetWidth; step.classList.add(dir);
    bars.forEach((b, j) => {
      b.classList.toggle("is-done", j < current);
      b.classList.toggle("is-current", j === current);
      if (j === current) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    back.hidden = current === 0;
    next.hidden = current === steps.length - 1;
    submit.hidden = current !== steps.length - 1;
    status.textContent = "";
    if (current === steps.length - 1) buildReview();
    const top = form.closest(".form-card").getBoundingClientRect().top;
    if (top < 80) window.scrollBy({ top: top - 100, behavior: "smooth" });
    const focusEl = step.querySelector("input:not([type=hidden]), select, textarea") || step.querySelector("legend");
    if (focusEl) { if (focusEl.tagName === "LEGEND") focusEl.setAttribute("tabindex", "-1"); focusEl.focus({ preventScroll: true }); }
  };
  next.addEventListener("click", () => { if (validateStep(current)) go(current + 1); });
  back.addEventListener("click", () => go(current - 1));
  form.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && current < steps.length - 1) {
      e.preventDefault();
      next.click();
    }
  });

  /* ---------- Submit ---------- */
  const summary = (d) => [
    `Name: ${d.name}`, `Email: ${d.email}`, d.phone && `Phone: ${d.phone}`, d.year && `Year: ${d.year}`,
    `Class: ${d.course}`, d.professor && `Professor: ${d.professor}`, `Help with: ${d.help.join(", ") || "Not specified"}`,
    d.next_exam && `Next exam: ${d.next_exam}`, `Format: ${d.format}`, `Hours per week: ${hoursLabel(d.hours)}`,
    d.availability && `Availability: ${d.availability}`, d.message && `\nMessage:\n${d.message}`
  ].filter(Boolean).join("\n");

  const success = (d, viaEmail) => {
    const card = form.closest(".form-card");
    card.innerHTML = `
      <div class="success" tabindex="-1">
        <div class="success-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
        <h2 class="h2" style="font-size:clamp(30px,4vw,42px)">${viaEmail ? "Almost done" : "Request sent"}</h2>
        <p>${viaEmail
          ? "Your email app should have opened with your request filled in. Press send there, and I’ll reply to set up your free session."
          : `Thanks${d.name ? ", " + esc(d.name.split(" ")[0]) : ""}! I’ll email you at <strong>${esc(d.email)}</strong> to set up your free 30-minute session.`}</p>
        <a class="btn btn-mint" href="examples.html">Browse examples while you wait</a>
      </div>`;
    card.querySelector(".success").focus();
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (current !== steps.length - 1) return;
    const d = read();
    if (d.botcheck) return;
    if (!validateStep(0)) return go(0);
    if (!validateStep(1)) return go(1);

    const key = CFG.web3formsKey;
    if (!key || /YOUR_/.test(key)) {
      window.location.href = `mailto:${CFG.email}?subject=${encodeURIComponent("Tutoring request: " + d.course)}&body=${encodeURIComponent(summary(d))}`;
      success(d, true);
      return;
    }

    submit.disabled = true;
    $(".btn-label", submit).textContent = "Sending…";
    status.textContent = ""; status.classList.remove("is-err");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: key,
          subject: `New tutoring request: ${d.name} · ${d.course}`,
          from_name: "Roberto Vazquez Tutoring website",
          replyto: d.email,
          name: d.name, email: d.email, phone: d.phone || "—", year: d.year || "—",
          class: d.course, professor: d.professor || "—", help_with: d.help.join(", ") || "Not specified",
          next_exam: d.next_exam || "—", format: d.format, hours_per_week: hoursLabel(d.hours),
          estimated_weekly: money(d.hours * CFG.hourlyRate), availability: d.availability || "—", message: d.message || "—",
          botcheck: ""
        })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || "failed");
      success(d, false);
    } catch (err) {
      status.innerHTML = `Your request didn’t send. Try again, or email <a class="link" href="mailto:${esc(CFG.email)}">${esc(CFG.email)}</a>.`;
      status.classList.add("is-err");
      submit.disabled = false;
      $(".btn-label", submit).textContent = "Send request";
    }
  });
})();
