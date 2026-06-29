/* =============================================
   CAT SCORE CALCULATOR — cat-score-calculator.js
   MBA Partner | Full Logic
   ============================================= */

/* ── EXAM CONFIG ── */
const SECTION_CONFIG = {
  varc: { total: 24, maxRaw: 72, tita: 5 }, // ~5 TITA (no negative)
  lrdi: { total: 20, maxRaw: 60, tita: 4 },
  quant: { total: 22, maxRaw: 66, tita: 6 },
};

const TOTAL_MAX_RAW = 198; // 72+60+66

/* ── SLOT SCALING FACTORS (difficulty normalisation) ──
   Based on CAT 2023-2025 slot-wise trends.
   Slot 2 is typically hardest; scaled scores converge. */
const SLOT_SCALE = {
  "1": { varc: 1.00, lrdi: 1.00, quant: 1.00 },
  "2": { varc: 1.03, lrdi: 1.05, quant: 1.04 },
  "3": { varc: 1.01, lrdi: 1.02, quant: 1.02 },
};

/* ── SCORE → PERCENTILE MAP (Overall, based on CAT 2022-24) ──
   Format: [minRaw, maxRaw, minPct, maxPct]
   Linear interpolation within each band.                      */
const PCT_MAP = [
  [180, 198, 99.90, 100.00],
  [165, 179, 99.70, 99.89],
  [150, 164, 99.40, 99.69],
  [135, 149, 99.00, 99.39],
  [120, 134, 98.00, 98.99],
  [110, 119, 97.00, 97.99],
  [100, 109, 95.50, 96.99],
  [90, 99, 93.00, 95.49],
  [80, 89, 90.00, 92.99],
  [70, 79, 85.00, 89.99],
  [60, 69, 78.00, 84.99],
  [50, 59, 70.00, 77.99],
  [40, 49, 60.00, 69.99],
  [30, 39, 48.00, 59.99],
  [20, 29, 35.00, 47.99],
  [10, 19, 20.00, 34.99],
  [0, 9, 0.00, 19.99],
];

/* Sectional percentile maps */
const SEC_PCT_MAP = {
  varc: [
    [65, 72, 99.50, 100],
    [58, 64, 99.00, 99.49],
    [52, 57, 98.00, 98.99],
    [46, 51, 96.00, 97.99],
    [40, 45, 93.00, 95.99],
    [34, 39, 88.00, 92.99],
    [28, 33, 80.00, 87.99],
    [20, 27, 65.00, 79.99],
    [12, 19, 45.00, 64.99],
    [0, 11, 0.00, 44.99],
  ],
  lrdi: [
    [54, 60, 99.50, 100],
    [48, 53, 99.00, 99.49],
    [42, 47, 97.50, 98.99],
    [36, 41, 95.00, 97.49],
    [30, 35, 90.00, 94.99],
    [24, 29, 82.00, 89.99],
    [18, 23, 70.00, 81.99],
    [12, 17, 52.00, 69.99],
    [6, 11, 30.00, 51.99],
    [0, 5, 0.00, 29.99],
  ],
  quant: [
    [60, 66, 99.50, 100],
    [54, 59, 99.00, 99.49],
    [48, 53, 97.50, 98.99],
    [42, 47, 95.00, 97.49],
    [36, 41, 91.00, 94.99],
    [30, 35, 85.00, 90.99],
    [24, 29, 75.00, 84.99],
    [18, 23, 60.00, 74.99],
    [12, 17, 40.00, 59.99],
    [0, 11, 0.00, 39.99],
  ],
};

/* ── COLLEGE SHORTLIST DATA ── */
const COLLEGE_LIST = [
  { name: "IIM Ahmedabad", minPct: 99.5, avgPkg: "₹34.7 LPA" },
  { name: "IIM Bangalore", minPct: 99.5, avgPkg: "₹33.4 LPA" },
  { name: "IIM Calcutta", minPct: 99.5, avgPkg: "₹35.0 LPA" },
  { name: "IIM Lucknow", minPct: 99.0, avgPkg: "₹31.0 LPA" },
  { name: "IIM Kozhikode", minPct: 99.0, avgPkg: "₹29.5 LPA" },
  { name: "IIM Indore", minPct: 99.0, avgPkg: "₹28.0 LPA" },
  { name: "FMS Delhi", minPct: 99.0, avgPkg: "₹34.1 LPA" },
  { name: "SPJIMR Mumbai", minPct: 99.0, avgPkg: "₹32.0 LPA" },
  { name: "IIM Mumbai", minPct: 99.0, avgPkg: "₹26.0 LPA" },
  { name: "IIM Shillong", minPct: 97.0, avgPkg: "₹23.0 LPA" },
  { name: "MDI Gurgaon", minPct: 97.0, avgPkg: "₹26.5 LPA" },
  { name: "IIFT Delhi", minPct: 98.0, avgPkg: "₹26.0 LPA" },
  { name: "TISS Mumbai", minPct: 97.0, avgPkg: "₹22.5 LPA" },
  { name: "IISc Bangalore", minPct: 98.0, avgPkg: "₹28.0 LPA" },
  { name: "SJMSOM IIT Bombay", minPct: 99.0, avgPkg: "₹28.0 LPA" },
  { name: "DMS IIT Delhi", minPct: 98.0, avgPkg: "₹23.4 LPA" },
  { name: "IIM Trichy", minPct: 96.0, avgPkg: "₹22.0 LPA" },
  { name: "IIM Ranchi", minPct: 95.0, avgPkg: "₹20.0 LPA" },
  { name: "IIM Rohtak", minPct: 94.0, avgPkg: "₹19.5 LPA" },
  { name: "IIM Udaipur", minPct: 94.0, avgPkg: "₹19.0 LPA" },
  { name: "IIM Raipur", minPct: 93.0, avgPkg: "₹18.5 LPA" },
  { name: "VGSOM IIT Kharagpur", minPct: 93.0, avgPkg: "₹22.75 LPA" },
  { name: "DoMS IIT Madras", minPct: 93.0, avgPkg: "₹17.9 LPA" },
  { name: "IMT Ghaziabad", minPct: 93.0, avgPkg: "₹16.25 LPA" },
  { name: "XIMB Bhubaneswar", minPct: 93.0, avgPkg: "₹17.0 LPA" },
  { name: "NITIE Mumbai", minPct: 92.0, avgPkg: "₹19.12 LPA" },
  { name: "IMI Delhi", minPct: 90.0, avgPkg: "₹17.91 LPA" },
  { name: "IIM Visakhapatnam", minPct: 90.0, avgPkg: "₹17.0 LPA" },
  { name: "IIM Amritsar", minPct: 90.0, avgPkg: "₹16.0 LPA" },
  { name: "IIT Roorkee (DoMS)", minPct: 90.0, avgPkg: "₹16.0 LPA" },
  { name: "BITSOM", minPct: 90.0, avgPkg: "₹23.41 LPA" },
  { name: "IIM Nagpur", minPct: 88.0, avgPkg: "₹15.0 LPA" },
  { name: "IIM Bodh Gaya", minPct: 88.0, avgPkg: "₹14.5 LPA" },
  { name: "GLIM Chennai", minPct: 88.0, avgPkg: "₹15.1 LPA" },
  { name: "FORE School Delhi", minPct: 85.0, avgPkg: "₹16.8 LPA" },
  { name: "GIM Goa", minPct: 85.0, avgPkg: "₹15.13 LPA" },
  { name: "IRMA Anand", minPct: 83.0, avgPkg: "₹15.72 LPA" },
  { name: "IIM Sambalpur", minPct: 85.0, avgPkg: "₹13.5 LPA" },
  { name: "IIM Sirmaur", minPct: 82.0, avgPkg: "₹12.0 LPA" },
  { name: "NIBM Pune", minPct: 80.0, avgPkg: "₹14.1 LPA" },
  { name: "KJSIMSR Mumbai", minPct: 78.0, avgPkg: "₹12.69 LPA" },
];

/* ── PCT TABLE REFERENCE ── */
const PCT_REFERENCE_TABLE = [
  { score: "175–198", pct: "99.7–100%ile", tag: "elite", label: "IIM ABC + FMS" },
  { score: "155–174", pct: "99.0–99.69%ile", tag: "elite", label: "IIM LIKSI + SPJIMR" },
  { score: "135–154", pct: "98.0–98.99%ile", tag: "great", label: "MDI, IIFT, IIT Bombay" },
  { score: "115–134", pct: "95.5–97.99%ile", tag: "great", label: "IIM Shillong, Trichy, TISS" },
  { score: "95–114", pct: "90.0–95.49%ile", tag: "good", label: "New IIMs, VGSOM, IMT" },
  { score: "75–94", pct: "78.0–89.99%ile", tag: "good", label: "Baby IIMs, FORE, GIM" },
  { score: "50–74", pct: "60.0–77.99%ile", tag: "avg", label: "NIBM, KJSIMSR & others" },
  { score: "Below 50", pct: "Below 60%ile", tag: "avg", label: "State MBA colleges" },
];

/* ── SCORE VS PERCENTILE REFERENCE TABLE ── */
const REF_TABLE_DATA = [
  { raw: "185–198", varc: "99.8+", lrdi: "99.7+", qa: "99.8+", overall: "99.90+" },
  { raw: "170–184", varc: "99.5", lrdi: "99.2", qa: "99.5", overall: "99.70" },
  { raw: "155–169", varc: "99.0", lrdi: "98.5", qa: "99.0", overall: "99.30" },
  { raw: "140–154", varc: "98.0", lrdi: "97.5", qa: "98.0", overall: "98.50" },
  { raw: "125–139", varc: "96.5", lrdi: "96.0", qa: "97.0", overall: "97.50" },
  { raw: "110–124", varc: "94.0", lrdi: "93.0", qa: "95.0", overall: "95.50" },
  { raw: "95–109", varc: "90.0", lrdi: "88.5", qa: "91.5", overall: "92.00" },
  { raw: "80–94", varc: "84.0", lrdi: "81.0", qa: "85.0", overall: "86.50" },
  { raw: "65–79", varc: "74.0", lrdi: "70.0", qa: "74.0", overall: "77.00" },
  { raw: "50–64", varc: "60.0", lrdi: "54.0", qa: "60.0", overall: "65.00" },
  { raw: "Below 50", varc: "<45", lrdi: "<40", qa: "<45", overall: "<55" },
];

/* ── FAQ DATA ── */
const FAQS = [
  {
    q: "What is the CAT 2026 marking scheme?",
    a: "CAT 2026 follows: +3 marks for every correct MCQ answer, −1 mark for every wrong MCQ answer, and 0 marks for skipped questions or TITA (Type In The Answer) questions regardless of right or wrong."
  },
  {
    q: "How is CAT score normalised across slots?",
    a: "IIMs use equi-percentile normalisation. If Slot 2 is harder than Slot 1, a score of 120 in Slot 2 may map to a higher percentile than 120 in Slot 1. Our tool applies approximate slot-wise scaling factors based on historical CAT 2023–2025 trends."
  },
  {
    q: "What is the difference between Raw Score and Scaled Score?",
    a: "Raw Score = (Correct × 3) − (Wrong MCQ × 1). Scaled Score adjusts for difficulty variation across slots using normalisation, so scores are comparable across all test-takers regardless of which slot they appeared in."
  },
  {
    q: "How many questions are in CAT 2026?",
    a: "CAT 2026 has 66 questions total: VARC – 24 questions (40 min), LRDI – 20 questions (40 min), Quantitative Aptitude – 22 questions (40 min). Total duration: 2 hours."
  },
  {
    q: "Is the percentile prediction 100% accurate?",
    a: "No. This is an estimate based on historical CAT 2022–2024 data. Official percentile depends on the actual difficulty of your slot, total number of test-takers, and IIM's official normalisation methodology. Treat this as an approximation ±2–3 percentile points."
  },
  {
    q: "What percentile do I need for IIM Calls?",
    a: "Old IIMs (BLACKI): 99%ile+ for General Male Engineers. FMS Delhi: 99%ile+. MDI Gurgaon: 97%ile+. New IIMs (Trichy, Ranchi, Rohtak): 93–96%ile. Baby IIMs: 85–93%ile. Category relaxations apply (OBC: ~3–5%ile lower, SC: ~8–10%ile lower, ST: ~15–18%ile lower)."
  },
  {
    q: "Do IIMs have sectional cutoffs?",
    a: "Yes. Most IIMs have sectional cutoffs in addition to overall cutoffs. Typically 80–85%ile per section for General candidates. You need to clear both overall AND sectional cutoffs to get a call."
  },
];

/* ═══════════════════════════════════════
   CORE CALCULATION ENGINE
   ═══════════════════════════════════════ */

let activeSlot = "1";

function calcRaw(correct, incorrect) {
  return (correct * 3) - (incorrect * 1);
}

function interpolatePct(score, map) {
  for (let i = 0; i < map.length; i++) {
    const [lo, hi, pLo, pHi] = map[i];
    if (score >= lo && score <= hi) {
      const frac = hi === lo ? 1 : (score - lo) / (hi - lo);
      return +(pLo + frac * (pHi - pLo)).toFixed(2);
    }
  }
  if (score > map[0][1]) return map[0][3];
  return 0;
}

function calcScaled(raw, section) {
  const factor = SLOT_SCALE[activeSlot][section] || 1;
  return +(raw * factor).toFixed(1);
}

function getVal(id) {
  return parseInt(document.getElementById(id).value) || 0;
}

function updateAutoSkipped() {
  ["varc", "lrdi", "quant"].forEach(sec => {
    const cfg = SECTION_CONFIG[sec];
    const c = getVal(`${sec}_correct`);
    const w = getVal(`${sec}_incorrect`);
    const skipped = Math.max(0, cfg.total - c - w);
    document.getElementById(`${sec}_skipped`).value = skipped;
  });
}

function updateLiveScores() {
  ["varc", "lrdi", "quant"].forEach(sec => {
    const c = getVal(`${sec}_correct`);
    const w = getVal(`${sec}_incorrect`);
    const raw = calcRaw(c, w);
    document.getElementById(`${sec}_raw`).textContent = raw.toFixed(2);
  });
}

/* ═══════════════════════════════════════
   MAIN CALCULATE FUNCTION
   ═══════════════════════════════════════ */

function calculate() {
  // Read inputs
  const varc_c = getVal("varc_correct"), varc_w = getVal("varc_incorrect");
  const lrdi_c = getVal("lrdi_correct"), lrdi_w = getVal("lrdi_incorrect");
  const quant_c = getVal("quant_correct"), quant_w = getVal("quant_incorrect");

  // Validate
  const varcTotal = varc_c + varc_w;
  const lrdiTotal = lrdi_c + lrdi_w;
  const quantTotal = quant_c + quant_w;

  if (varcTotal > SECTION_CONFIG.varc.total ||
    lrdiTotal > SECTION_CONFIG.lrdi.total ||
    quantTotal > SECTION_CONFIG.quant.total) {
    alert("Total attempts (correct + incorrect) cannot exceed total questions in a section.");
    return;
  }

  // Raw scores
  const varc_raw = calcRaw(varc_c, varc_w);
  const lrdi_raw = calcRaw(lrdi_c, lrdi_w);
  const quant_raw = calcRaw(quant_c, quant_w);
  const total_raw = varc_raw + lrdi_raw + quant_raw;

  // Scaled scores
  const varc_scaled = calcScaled(varc_raw, "varc");
  const lrdi_scaled = calcScaled(lrdi_raw, "lrdi");
  const quant_scaled = calcScaled(quant_raw, "quant");
  const total_scaled = +(varc_scaled + lrdi_scaled + quant_scaled).toFixed(1);

  // Percentiles
  const varc_pct = interpolatePct(varc_raw, SEC_PCT_MAP.varc);
  const lrdi_pct = interpolatePct(lrdi_raw, SEC_PCT_MAP.lrdi);
  const quant_pct = interpolatePct(quant_raw, SEC_PCT_MAP.quant);
  const overall_pct = interpolatePct(total_raw, PCT_MAP);

  // Show results
  renderResults({
    raw: total_raw, scaled: total_scaled, pct: overall_pct,
    varc: { c: varc_c, w: varc_w, raw: varc_raw, pct: varc_pct },
    lrdi: { c: lrdi_c, w: lrdi_w, raw: lrdi_raw, pct: lrdi_pct },
    quant: { c: quant_c, w: quant_w, raw: quant_raw, pct: quant_pct },
  });
}

/* ═══════════════════════════════════════
   RENDER FUNCTIONS
   ═══════════════════════════════════════ */

function renderResults(data) {
  document.getElementById("placeholder").style.display = "none";
  const rc = document.getElementById("resultsContent");
  rc.style.display = "flex";

  // Overall card
  document.getElementById("oc_slot").textContent = `CAT 2026 — Slot ${activeSlot}`;
  document.getElementById("oc_raw").textContent = data.raw;
  document.getElementById("oc_scaled").textContent = data.scaled;
  document.getElementById("oc_percentile").textContent = data.pct + "%ile";

  // Percentile bar
  const barPct = Math.min(100, (data.pct / 100) * 100);
  setTimeout(() => {
    document.getElementById("percentileBarFill").style.width = barPct + "%";
  }, 100);

  // Section breakdown
  renderSection("varc", data.varc, 72);
  renderSection("lrdi", data.lrdi, 60);
  renderSection("quant", data.quant, 66);

  // PCT reference table
  renderPctTable(data.pct);

  // College shortlist
  renderCollegeShortlist(data.pct);

  // Scroll to results on mobile
  if (window.innerWidth < 920) {
    document.getElementById("resultsPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderSection(sec, d, maxRaw) {
  document.getElementById(`sb_${sec}_raw`).textContent = d.raw;
  document.getElementById(`sb_${sec}_c`).textContent = `${d.c} correct`;
  document.getElementById(`sb_${sec}_w`).textContent = `${d.w} wrong`;
  const barPct = Math.max(0, (d.raw / maxRaw) * 100);
  setTimeout(() => {
    document.getElementById(`${sec}_bar`).style.width = barPct + "%";
  }, 150);
}

function renderPctTable(overall_pct) {
  const tbody = document.getElementById("pctTableBody");
  if (!tbody) return;
  tbody.innerHTML = PCT_REFERENCE_TABLE.map(row => {
    const isUser = isPctInRange(overall_pct, row.score);
    return `
      <tr style="${isUser ? "background:rgba(99,102,241,.06);" : ""}">
        <td class="pct-range">${row.score}${isUser ? " ← You" : ""}</td>
        <td class="pct-val">${row.pct}</td>
        <td><span class="chance-tag ${row.tag}">${row.label}</span></td>
      </tr>`;
  }).join("");
}

function isPctInRange(pct, scoreStr) {
  // Match the overall percentile to the right row
  if (scoreStr === "Below 50") return pct < 60;
  if (scoreStr === "50–74") return pct >= 60 && pct < 78;
  if (scoreStr === "75–94") return pct >= 78 && pct < 90;
  if (scoreStr === "95–114") return pct >= 90 && pct < 95.5;
  if (scoreStr === "115–134") return pct >= 95.5 && pct < 98;
  if (scoreStr === "135–154") return pct >= 98 && pct < 99;
  if (scoreStr === "155–174") return pct >= 99 && pct < 99.7;
  if (scoreStr === "175–198") return pct >= 99.7;
  return false;
}

function renderCollegeShortlist(pct) {
  const el = document.getElementById("collegeShortlist");
  if (!el) return;

  // Classify
  const safe = COLLEGE_LIST.filter(c => pct >= c.minPct + 1.5);
  const moderate = COLLEGE_LIST.filter(c => pct >= c.minPct && pct < c.minPct + 1.5);
  const reach = COLLEGE_LIST.filter(c => pct >= c.minPct - 2 && pct < c.minPct);

  const combined = [
    ...safe.slice(0, 4).map(c => ({ ...c, type: "safe" })),
    ...moderate.slice(0, 4).map(c => ({ ...c, type: "moderate" })),
    ...reach.slice(0, 3).map(c => ({ ...c, type: "reach" })),
  ];

  if (!combined.length) {
    el.innerHTML = `<div style="padding:20px;text-align:center;color:var(--ink-faint);font-size:14px;">
      Keep preparing — even below 60%ile many private MBA colleges are available!
    </div>`;
    return;
  }

  el.innerHTML = combined.map((c, i) => `
    <div class="cs-card" style="animation-delay:${i * 40}ms">
      <div>
        <div class="cs-name">${c.name}</div>
        <div class="cs-pkg">${c.avgPkg}</div>
      </div>
      <span class="cs-chance cs-${c.type}">
        ${c.type === "safe" ? "Safe 🟢" : c.type === "moderate" ? "Moderate 🟡" : "Reach 🔴"}
      </span>
    </div>`).join("");
}

/* ═══════════════════════════════════════
   REFERENCE TABLE (bottom section)
   ═══════════════════════════════════════ */

function buildRefTable() {
  const tbody = document.getElementById("refTableBody");
  if (!tbody) return;
  tbody.innerHTML = REF_TABLE_DATA.map(r => `
    <tr>
      <td>${r.raw}</td>
      <td class="ref-pct">${r.varc}</td>
      <td class="ref-pct">${r.lrdi}</td>
      <td class="ref-pct">${r.qa}</td>
      <td class="ref-pct" style="color:var(--success)">${r.overall}</td>
    </tr>`).join("");
}

/* ═══════════════════════════════════════
   FAQ
   ═══════════════════════════════════════ */

function buildFAQ() {
  const el = document.getElementById("faqList");
  if (!el) return;
  el.innerHTML = FAQS.map((f, i) => `
    <div class="faq-item" id="faq_${i}">
      <button class="faq-q" onclick="toggleFAQ(${i})">
        ${f.q}
        <span class="faq-caret">▾</span>
      </button>
      <div class="faq-a">${f.a}</div>
    </div>`).join("");
}

function toggleFAQ(i) {
  const item = document.getElementById(`faq_${i}`);
  item.classList.toggle("open");
}

/* ═══════════════════════════════════════
   RESET
   ═══════════════════════════════════════ */

function resetAll() {
  ["varc", "lrdi", "quant"].forEach(sec => {
    document.getElementById(`${sec}_correct`).value = 0;
    document.getElementById(`${sec}_incorrect`).value = 0;
    document.getElementById(`${sec}_skipped`).value = SECTION_CONFIG[sec].total;
    document.getElementById(`${sec}_raw`).textContent = "0.00";
  });

  document.getElementById("placeholder").style.display = "flex";
  document.getElementById("resultsContent").style.display = "none";
  document.getElementById("percentileBarFill").style.width = "0%";

  ["varc_bar", "lrdi_bar", "quant_bar"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.width = "0%";
  });
}

/* ═══════════════════════════════════════
   INPUT LISTENERS (live score update)
   ═══════════════════════════════════════ */

function bindInputs() {
  ["varc", "lrdi", "quant"].forEach(sec => {
    ["correct", "incorrect"].forEach(type => {
      const el = document.getElementById(`${sec}_${type}`);
      if (!el) return;
      el.addEventListener("input", () => {
        // Clamp
        const max = SECTION_CONFIG[sec].total;
        let c = parseInt(document.getElementById(`${sec}_correct`).value) || 0;
        let w = parseInt(document.getElementById(`${sec}_incorrect`).value) || 0;
        if (c + w > max) {
          // reduce the one just changed
          if (type === "correct") c = max - w;
          else w = max - c;
          document.getElementById(`${sec}_correct`).value = Math.max(0, c);
          document.getElementById(`${sec}_incorrect`).value = Math.max(0, w);
        }
        updateAutoSkipped();
        updateLiveScores();
      });
    });
  });
}

/* ═══════════════════════════════════════
   SLOT BUTTONS
   ═══════════════════════════════════════ */

function bindSlotBtns() {
  document.querySelectorAll(".slot-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      activeSlot = this.dataset.slot;
      updateLiveScores();
    });
  });
}

/* ═══════════════════════════════════════
   INIT
   ═══════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", function () {
  bindInputs();
  bindSlotBtns();
  buildRefTable();
  buildFAQ();

  // Calculate button
  const calcBtn = document.getElementById("calcBtn");
  if (calcBtn) calcBtn.addEventListener("click", calculate);

  // Reset button
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) resetBtn.addEventListener("click", resetAll);

  // Allow Enter key
  document.querySelectorAll(".attempt-input:not([readonly])").forEach(inp => {
    inp.addEventListener("keydown", e => {
      if (e.key === "Enter") calculate();
    });
  });

  // Init skipped values
  updateAutoSkipped();

  // Ensure results hidden on load (safety net)
  const rc = document.getElementById("resultsContent");
  const ph = document.getElementById("placeholder");
  if (rc) rc.style.display = "none";
  if (ph) ph.style.display = "flex";
});