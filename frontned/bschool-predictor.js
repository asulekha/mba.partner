/* =============================================
   B-SCHOOL PREDICTOR — bschool-predictor.js
   MBA Partner | Full Prediction Logic
   ============================================= */

/* ---- COLLEGE DATABASE ---- */
const COLLEGES = [
    // ── OLD IIMs (BLACKI) ──────────────────────────────
    { id: 1, name: "IIM Ahmedabad", short: "IIM-A", tier: "blacki", avgPkg: "₹34.7 LPA", highPkg: "₹1.15 Cr", exam: "CAT", cutoff: { General: 99.5, OBC: 97, SC: 90, ST: 80, EWS: 98, PWD: 85 }, acadsWeight: "high", category: "Old IIM" },
    { id: 2, name: "IIM Bangalore", short: "IIM-B", tier: "blacki", avgPkg: "₹33.4 LPA", highPkg: "₹1.10 Cr", exam: "CAT", cutoff: { General: 99.5, OBC: 97, SC: 90, ST: 80, EWS: 98, PWD: 85 }, acadsWeight: "high", category: "Old IIM" },
    { id: 3, name: "IIM Calcutta", short: "IIM-C", tier: "blacki", avgPkg: "₹35.0 LPA", highPkg: "₹1.20 Cr", exam: "CAT", cutoff: { General: 99.5, OBC: 97, SC: 90, ST: 80, EWS: 98, PWD: 85 }, acadsWeight: "high", category: "Old IIM" },
    { id: 4, name: "IIM Lucknow", short: "IIM-L", tier: "blacki", avgPkg: "₹31.0 LPA", highPkg: "₹95 L", exam: "CAT", cutoff: { General: 99, OBC: 96, SC: 88, ST: 78, EWS: 97, PWD: 82 }, acadsWeight: "high", category: "Old IIM" },
    { id: 5, name: "IIM Kozhikode", short: "IIM-K", tier: "blacki", avgPkg: "₹29.5 LPA", highPkg: "₹85 L", exam: "CAT", cutoff: { General: 99, OBC: 96, SC: 88, ST: 78, EWS: 97, PWD: 82 }, acadsWeight: "high", category: "Old IIM" },
    { id: 6, name: "IIM Indore", short: "IIM-I", tier: "blacki", avgPkg: "₹28.0 LPA", highPkg: "₹80 L", exam: "CAT", cutoff: { General: 99, OBC: 95, SC: 87, ST: 77, EWS: 97, PWD: 80 }, acadsWeight: "high", category: "Old IIM" },

    // ── TIER 1 NON-IIM ─────────────────────────────────
    { id: 7, name: "FMS Delhi", short: "FMS", tier: "t1", avgPkg: "₹34.1 LPA", highPkg: "₹1.23 Cr", exam: "CAT", cutoff: { General: 99, OBC: 95, SC: 85, ST: 75, EWS: 97, PWD: 80 }, acadsWeight: "low", category: "Top Tier-1" },
    { id: 8, name: "SPJIMR Mumbai", short: "SPJIMR", tier: "t1", avgPkg: "₹32.0 LPA", highPkg: "₹96 L", exam: "CAT/GMAT", cutoff: { General: 99, OBC: 95, SC: 85, ST: 75, EWS: 97, PWD: 80 }, acadsWeight: "medium", category: "Top Tier-1" },
    { id: 9, name: "MDI Gurgaon", short: "MDI", tier: "t1", avgPkg: "₹26.5 LPA", highPkg: "₹72 L", exam: "CAT", cutoff: { General: 97, OBC: 93, SC: 82, ST: 72, EWS: 95, PWD: 77 }, acadsWeight: "medium", category: "Top Tier-1" },
    { id: 10, name: "IIFT Delhi", short: "IIFT-D", tier: "t1", avgPkg: "₹26.0 LPA", highPkg: "₹68 L", exam: "IIFT/CAT", cutoff: { General: 98, OBC: 94, SC: 83, ST: 73, EWS: 96, PWD: 78 }, acadsWeight: "medium", category: "Top Tier-1" },
    { id: 11, name: "IIFT Kolkata", short: "IIFT-K", tier: "t1", avgPkg: "₹22.0 LPA", highPkg: "₹55 L", exam: "IIFT/CAT", cutoff: { General: 96, OBC: 92, SC: 80, ST: 70, EWS: 94, PWD: 75 }, acadsWeight: "medium", category: "Top Tier-1" },
    { id: 12, name: "TISS Mumbai", short: "TISS", tier: "t1", avgPkg: "₹22.5 LPA", highPkg: "₹60 L", exam: "CAT/TISS-NET", cutoff: { General: 97, OBC: 93, SC: 82, ST: 72, EWS: 95, PWD: 77 }, acadsWeight: "low", category: "Top Tier-1" },
    { id: 13, name: "IIM Mumbai", short: "IIM-Mum", tier: "t1", avgPkg: "₹26.0 LPA", highPkg: "₹64 L", exam: "CAT", cutoff: { General: 99, OBC: 95, SC: 85, ST: 75, EWS: 97, PWD: 80 }, acadsWeight: "high", category: "Old IIM" },
    { id: 14, name: "IISc Bangalore (MBA)", short: "IISc", tier: "t1", avgPkg: "₹28.0 LPA", highPkg: "₹76 L", exam: "CAT", cutoff: { General: 98, OBC: 94, SC: 83, ST: 73, EWS: 96, PWD: 78 }, acadsWeight: "high", category: "Top Tier-1" },
    { id: 15, name: "DMS IIT Delhi", short: "IIT-D", tier: "t1", avgPkg: "₹23.4 LPA", highPkg: "₹40.5 L", exam: "CAT", cutoff: { General: 98, OBC: 94, SC: 83, ST: 73, EWS: 96, PWD: 78 }, acadsWeight: "medium", category: "IIT B-School" },
    { id: 16, name: "SJMSOM IIT Bombay", short: "IIT-B", tier: "t1", avgPkg: "₹28.0 LPA", highPkg: "₹63 L", exam: "CAT", cutoff: { General: 99, OBC: 95, SC: 85, ST: 75, EWS: 97, PWD: 80 }, acadsWeight: "medium", category: "IIT B-School" },

    // ── IIM SHILLONG + NEW IIMs ─────────────────────────
    { id: 17, name: "IIM Shillong", short: "IIM-S", tier: "t2a", avgPkg: "₹23.0 LPA", highPkg: "₹55 L", exam: "CAT", cutoff: { General: 97, OBC: 93, SC: 82, ST: 72, EWS: 95, PWD: 77 }, acadsWeight: "medium", category: "Old IIM" },
    { id: 18, name: "IIM Trichy", short: "IIM-T", tier: "t2a", avgPkg: "₹22.0 LPA", highPkg: "₹46 L", exam: "CAT", cutoff: { General: 96, OBC: 90, SC: 78, ST: 68, EWS: 93, PWD: 73 }, acadsWeight: "medium", category: "New IIM" },
    { id: 19, name: "IIM Ranchi", short: "IIM-R", tier: "t2a", avgPkg: "₹20.0 LPA", highPkg: "₹45 L", exam: "CAT", cutoff: { General: 95, OBC: 89, SC: 77, ST: 67, EWS: 92, PWD: 72 }, acadsWeight: "medium", category: "New IIM" },
    { id: 20, name: "IIM Rohtak", short: "IIM-Ro", tier: "t2a", avgPkg: "₹19.5 LPA", highPkg: "₹44 L", exam: "CAT", cutoff: { General: 94, OBC: 88, SC: 76, ST: 66, EWS: 91, PWD: 71 }, acadsWeight: "medium", category: "New IIM" },
    { id: 21, name: "IIM Udaipur", short: "IIM-U", tier: "t2a", avgPkg: "₹19.0 LPA", highPkg: "₹42 L", exam: "CAT", cutoff: { General: 94, OBC: 88, SC: 76, ST: 66, EWS: 91, PWD: 71 }, acadsWeight: "medium", category: "New IIM" },
    { id: 22, name: "IIM Raipur", short: "IIM-Ra", tier: "t2a", avgPkg: "₹18.5 LPA", highPkg: "₹40 L", exam: "CAT", cutoff: { General: 93, OBC: 87, SC: 75, ST: 65, EWS: 90, PWD: 70 }, acadsWeight: "medium", category: "New IIM" },

    // ── SOLID TIER-2 ────────────────────────────────────
    { id: 23, name: "IMT Ghaziabad", short: "IMT-G", tier: "t2b", avgPkg: "₹16.25 LPA", "highPkg": "₹41.5 L", exam: "CAT/XAT/GMAT", cutoff: { General: 93, OBC: 86, SC: 74, ST: 64, EWS: 90, PWD: 69 }, acadsWeight: "low", category: "Strong Tier-2" },
    { id: 24, name: "XIMB Bhubaneswar", short: "XIMB", tier: "t2b", avgPkg: "₹17.0 LPA", highPkg: "₹38 L", exam: "CAT/XAT", cutoff: { General: 93, OBC: 86, SC: 74, ST: 64, EWS: 90, PWD: 69 }, acadsWeight: "low", category: "Strong Tier-2" },
    { id: 25, name: "VGSOM IIT Kharagpur", short: "IIT-Kgp", tier: "t2b", avgPkg: "₹22.75 LPA", "highPkg": "₹37.6 L", exam: "CAT", cutoff: { General: 93, OBC: 86, SC: 74, ST: 64, EWS: 90, PWD: 69 }, acadsWeight: "medium", category: "IIT B-School" },
    { id: 26, name: "DoMS IIT Madras", short: "IIT-M", tier: "t2b", avgPkg: "₹17.9 LPA", highPkg: "₹35.5 L", exam: "CAT", cutoff: { General: 93, OBC: 86, SC: 74, ST: 64, EWS: 90, PWD: 69 }, acadsWeight: "medium", category: "IIT B-School" },
    { id: 27, name: "SCMHRD Pune", short: "SCMHRD", tier: "t2b", avgPkg: "₹22.16 LPA", "highPkg": "₹35.9 L", exam: "SNAP", cutoff: { General: 96, OBC: 89, SC: 77, ST: 67, EWS: 93, PWD: 72 }, acadsWeight: "low", category: "Strong Tier-2" },
    { id: 28, name: "SIBM Pune", short: "SIBM", tier: "t2b", avgPkg: "₹28.83 LPA", "highPkg": "₹53.6 L", exam: "SNAP", cutoff: { General: 97, OBC: 92, SC: 80, ST: 70, EWS: 95, PWD: 75 }, acadsWeight: "low", category: "Strong Tier-2" },
    { id: 29, name: "MICA Ahmedabad", short: "MICA", tier: "t2b", avgPkg: "₹19.22 LPA", "highPkg": "₹40.9 L", exam: "CAT/XAT+MICAT", cutoff: { General: 80, OBC: 75, SC: 65, ST: 55, EWS: 78, PWD: 60 }, acadsWeight: "low", category: "Strong Tier-2" },
    { id: 30, name: "IMI Delhi", short: "IMI", tier: "t2b", avgPkg: "₹17.91 LPA", "highPkg": "₹40.3 L", exam: "CAT/XAT/GMAT", cutoff: { General: 90, OBC: 83, SC: 71, ST: 61, EWS: 87, PWD: 66 }, acadsWeight: "low", category: "Strong Tier-2" },
    { id: 31, name: "GLIM Chennai", short: "GLIM", tier: "t2b", avgPkg: "₹15.1 LPA", highPkg: "₹37 L", exam: "CAT/XAT/GMAT", cutoff: { General: 88, OBC: 81, SC: 69, ST: 59, EWS: 85, PWD: 64 }, acadsWeight: "low", category: "Strong Tier-2" },
    { id: 32, name: "GIM Goa", short: "GIM", tier: "t2b", avgPkg: "₹15.13 LPA", "highPkg": "₹32.2 L", exam: "CAT/XAT/GMAT", cutoff: { General: 85, OBC: 78, SC: 66, ST: 56, EWS: 82, PWD: 61 }, acadsWeight: "low", category: "Strong Tier-2" },

    // ── BABY IIMs & OTHERS ──────────────────────────────
    { id: 33, name: "IIM Visakhapatnam", short: "IIM-V", tier: "t3", avgPkg: "₹17.0 LPA", highPkg: "₹36 L", exam: "CAT", cutoff: { General: 90, OBC: 83, SC: 70, ST: 60, EWS: 87, PWD: 65 }, acadsWeight: "medium", category: "Baby IIM" },
    { id: 34, name: "IIM Amritsar", short: "IIM-Am", tier: "t3", avgPkg: "₹16.0 LPA", highPkg: "₹33 L", exam: "CAT", cutoff: { General: 90, OBC: 83, SC: 70, ST: 60, EWS: 87, PWD: 65 }, acadsWeight: "medium", category: "Baby IIM" },
    { id: 35, name: "IIM Bodh Gaya", short: "IIM-BG", tier: "t3", avgPkg: "₹14.5 LPA", highPkg: "₹28 L", exam: "CAT", cutoff: { General: 88, OBC: 81, SC: 68, ST: 58, EWS: 85, PWD: 63 }, acadsWeight: "medium", category: "Baby IIM" },
    { id: 36, name: "IIM Nagpur", short: "IIM-N", tier: "t3", avgPkg: "₹15.0 LPA", highPkg: "₹30 L", exam: "CAT", cutoff: { General: 88, OBC: 81, SC: 68, ST: 58, EWS: 85, PWD: 63 }, acadsWeight: "medium", category: "Baby IIM" },
    { id: 37, name: "IIM Sambalpur", short: "IIM-Sm", tier: "t3", avgPkg: "₹13.5 LPA", highPkg: "₹26 L", exam: "CAT", cutoff: { General: 85, OBC: 78, SC: 65, ST: 55, EWS: 82, PWD: 60 }, acadsWeight: "medium", category: "Baby IIM" },
    { id: 38, name: "IIM Sirmaur", short: "IIM-Sir", tier: "t3", avgPkg: "₹12.0 LPA", highPkg: "₹24 L", exam: "CAT", cutoff: { General: 82, OBC: 75, SC: 62, ST: 52, EWS: 79, PWD: 57 }, acadsWeight: "medium", category: "Baby IIM" },
    { id: 39, name: "FORE School Delhi", short: "FORE", tier: "t3", avgPkg: "₹16.8 LPA", highPkg: "₹29 L", exam: "CAT/XAT/GMAT", cutoff: { General: 85, OBC: 78, SC: 65, ST: 55, EWS: 82, PWD: 60 }, acadsWeight: "low", category: "Strong Tier-2" },
    { id: 40, name: "IRMA Anand", short: "IRMA", tier: "t3", avgPkg: "₹15.72 LPA", "highPkg": "₹31.8 L", exam: "CAT/XAT", cutoff: { General: 83, OBC: 76, SC: 64, ST: 54, EWS: 80, PWD: 59 }, acadsWeight: "low", category: "Strong Tier-2" },
    { id: 41, name: "NITIE Mumbai (NITIEM)", "short": "NITIE", tier: "t2b", avgPkg: "₹19.12 LPA", "highPkg": "₹32 L", exam: "CAT", cutoff: { General: 92, OBC: 85, SC: 73, ST: 63, EWS: 89, PWD: 68 }, acadsWeight: "low", category: "Strong Tier-2" },
    { id: 42, name: "IIT Roorkee (DoMS)", short: "IIT-R", tier: "t3", avgPkg: "₹16.0 LPA", highPkg: "₹30 L", exam: "CAT", cutoff: { General: 90, OBC: 83, SC: 71, ST: 61, EWS: 87, PWD: 66 }, acadsWeight: "medium", category: "IIT B-School" },
    { id: 43, name: "BITSOM", short: "BITSOM", tier: "t2b", avgPkg: "₹23.41 LPA", "highPkg": "₹50 L", exam: "CAT/GMAT/GRE", cutoff: { General: 90, OBC: 83, SC: 71, ST: 61, EWS: 87, PWD: 66 }, acadsWeight: "low", category: "Strong Tier-2" },
    { id: 44, name: "NIBM Pune", short: "NIBM", tier: "t3", avgPkg: "₹14.1 LPA", highPkg: "₹26.6 L", exam: "CAT/XAT/CMAT", cutoff: { General: 80, OBC: 73, SC: 61, ST: 51, EWS: 77, PWD: 56 }, acadsWeight: "low", category: "Other" },
    { id: 45, name: "KJSIMSR Mumbai", short: "KJ Somaiya", tier: "t3", avgPkg: "₹12.69 LPA", "highPkg": "₹27.3 L", exam: "CAT/XAT/NMAT", cutoff: { General: 78, OBC: 71, SC: 59, ST: 49, EWS: 75, PWD: 54 }, acadsWeight: "low", category: "Other" },
];

/* ---- COLLEGE TABLE DATA ---- */
const TABLE_COLLEGES = [
    { rank: 1, name: "FMS Delhi", avg: "₹34.1L", high: "₹1.23 Cr", cutoff: "99%ile+", exam: "CAT" },
    { rank: 2, name: "IIM Ahmedabad", avg: "₹34.7L", high: "₹1.15 Cr", cutoff: "99.5%ile", exam: "CAT" },
    { rank: 3, name: "IIM Calcutta", avg: "₹35.0L", high: "₹1.20 Cr", cutoff: "99.5%ile", exam: "CAT" },
    { rank: 4, name: "IIM Bangalore", avg: "₹33.4L", high: "₹1.10 Cr", cutoff: "99.5%ile", exam: "CAT" },
    { rank: 5, name: "SPJIMR Mumbai", avg: "₹32.0L", high: "₹96L", cutoff: "99%ile+", exam: "CAT/GMAT" },
    { rank: 6, name: "SIBM Pune", avg: "₹28.83L", high: "₹53.6L", cutoff: "97%ile+", exam: "SNAP" },
    { rank: 7, name: "SJMSOM IIT Bombay", avg: "₹28.0L", high: "₹63L", cutoff: "99%ile+", exam: "CAT" },
    { rank: 8, name: "IIM Lucknow", avg: "₹31.0L", high: "₹95L", cutoff: "99%ile+", exam: "CAT" },
    { rank: 9, name: "IIM Kozhikode", avg: "₹29.5L", high: "₹85L", cutoff: "99%ile+", exam: "CAT" },
    { rank: 10, name: "IIM Indore", avg: "₹28.0L", high: "₹80L", cutoff: "99%ile+", exam: "CAT" },
    { rank: 11, name: "MDI Gurgaon", avg: "₹26.5L", high: "₹72L", cutoff: "97%ile+", exam: "CAT" },
    { rank: 12, name: "IIFT Delhi", avg: "₹26.0L", high: "₹68L", cutoff: "98%ile+", exam: "IIFT/CAT" },
    { rank: 13, name: "IIM Mumbai", avg: "₹26.0L", high: "₹64L", cutoff: "99%ile+", exam: "CAT" },
    { rank: 14, name: "BITSOM", avg: "₹23.41L", high: "₹50L", cutoff: "90%ile+", exam: "CAT/GMAT" },
    { rank: 15, name: "DMS IIT Delhi", avg: "₹23.4L", high: "₹40.5L", cutoff: "98%ile+", exam: "CAT" },
    { rank: 16, name: "SCMHRD Pune", avg: "₹22.16L", high: "₹35.9L", cutoff: "96%ile+", exam: "SNAP" },
    { rank: 17, name: "VGSOM IIT Kharagpur", avg: "₹22.75L", high: "₹37.6L", cutoff: "93%ile+", exam: "CAT" },
    { rank: 18, name: "TISS Mumbai", avg: "₹22.5L", high: "₹60L", cutoff: "97%ile+", exam: "CAT/TISS-NET" },
    { rank: 19, name: "IMT Ghaziabad", avg: "₹16.25L", high: "₹41.5L", cutoff: "93%ile+", exam: "CAT/XAT" },
    { rank: 20, name: "FORE School Delhi", avg: "₹16.8L", high: "₹29L", cutoff: "85%ile+", exam: "CAT/XAT" },
];

/* ============================================================
   CORE PREDICTION ENGINE
   ============================================================ */

/**
 * Get the percentile cutoff for this college given user's category.
 * Female GEM bonus: -0.5 percentile points on General cutoff.
 */
function getEffectiveCutoff(college, category, gender) {
    let base = college.cutoff[category] || college.cutoff["General"];
    if (gender === "Female" && category === "General") base = Math.max(base - 0.5, 0);
    return base;
}

/**
 * Compute an academics score 0–10 from 10th, 12th, grad percentages.
 */
function academicsScore(tenth, twelfth, grad) {
    const t = parseFloat(tenth) || 0;
    const tw = parseFloat(twelfth) || 0;
    const g = parseFloat(grad) || tw; // fallback to 12th if grad not entered
    const avg = (t + tw + g) / 3;
    return avg / 10; // returns 0–10
}

/**
 * Main prediction function.
 * Returns { safe: [], moderate: [], reach: [] }
 */
function predict(percentile, category, gender, tenth, twelfth, grad, stream, workex) {
    const pct = parseFloat(percentile);
    const acads = academicsScore(tenth, twelfth, grad);
    const wx = parseInt(workex) || 0;

    const safe = [], moderate = [], reach = [];

    COLLEGES.forEach(college => {
        const cutoff = getEffectiveCutoff(college, category, gender);

        // Gap between user percentile and cutoff
        const gap = pct - cutoff;

        // Academics penalty: if college weights academics heavily and acads < 7.5
        let acadsPenalty = 0;
        if (college.acadsWeight === "high" && acads < 7.5) acadsPenalty = 1.5;
        else if (college.acadsWeight === "medium" && acads < 6.5) acadsPenalty = 0.75;

        // Non-engineer bonus at colleges that prefer diversity
        let streamBonus = 0;
        if (stream === "NonEngineer" && ["blacki", "t1"].includes(college.tier)) streamBonus = 0.3;

        // Work-ex bonus
        let wxBonus = 0;
        if (wx >= 24) wxBonus = 0.4;
        else if (wx >= 12) wxBonus = 0.2;

        // Effective gap after adjustments
        const effectiveGap = gap + streamBonus + wxBonus - acadsPenalty;

        // Classification
        if (effectiveGap >= 1.5) {
            safe.push({ ...college, chance: "safe", gap: effectiveGap, cutoff });
        } else if (effectiveGap >= 0 && effectiveGap < 1.5) {
            moderate.push({ ...college, chance: "moderate", gap: effectiveGap, cutoff });
        } else if (effectiveGap >= -2.5) {
            reach.push({ ...college, chance: "reach", gap: effectiveGap, cutoff });
        }
        // Below -2.5: don't show (too far)
    });

    // Sort within each bucket: higher avg package first
    const sortByPkg = (a, b) => {
        const parseP = c => parseFloat(c.avgPkg.replace(/[^\d.]/g, "")) || 0;
        return parseP(b) - parseP(a);
    };

    return {
        safe: safe.sort(sortByPkg),
        moderate: moderate.sort(sortByPkg),
        reach: reach.sort(sortByPkg),
    };
}

/* ============================================================
   UI HELPERS
   ============================================================ */

function chanceLabel(chance) {
    if (chance === "safe") return { text: "Safe Bet 🟢", cls: "chance-safe" };
    if (chance === "moderate") return { text: "Moderate 🟡", cls: "chance-moderate" };
    if (chance === "reach") return { text: "Reach 🔴", cls: "chance-reach" };
    return { text: "", cls: "" };
}

function buildCollegeCard(college, index) {
    const cl = chanceLabel(college.chance);
    return `
    <div class="college-card" style="animation-delay:${index * 40}ms">
      <div class="college-card-left">
        <span class="college-rank">#${index + 1} · ${college.category}</span>
        <span class="college-name">${college.name}</span>
        <div class="college-meta">
          <span class="college-meta-item">📦 ${college.avgPkg}</span>
          <span class="college-meta-item">📝 ${college.exam}</span>
          <span class="college-cutoff-tag">Cutoff ≥ ${college.cutoff}%ile</span>
        </div>
      </div>
      <div class="college-card-right">
        <span class="chance-badge ${cl.cls}">${cl.text}</span>
        <span class="college-pkg">${college.avgPkg}</span>
      </div>
    </div>`;
}

function buildSummaryCard(safe, moderate, reach, percentile, category) {
    const total = safe.length + moderate.length + reach.length;
    return `
    <div class="summary-card">
      <h3>Results for ${percentile}%ile · ${category}</h3>
      <div class="summary-stats">
        <div class="summary-stat"><span class="s-num">${total}</span><span class="s-label">Colleges Found</span></div>
        <div class="summary-stat"><span class="s-num safe">${safe.length}</span><span class="s-label">Safe Bets</span></div>
        <div class="summary-stat"><span class="s-num moderate">${moderate.length}</span><span class="s-label">Moderate</span></div>
        <div class="summary-stat"><span class="s-num reach">${reach.length}</span><span class="s-label">Reach</span></div>
      </div>
    </div>`;
}

function renderColleges(list) {
    if (!list.length) {
        return `<div class="no-results"><h4>No colleges in this bucket</h4><p>Try adjusting your inputs or check other tabs.</p></div>`;
    }
    return list.map((c, i) => buildCollegeCard(c, i)).join("");
}

/* ============================================================
   COLLEGE TABLE
   ============================================================ */
function buildCollegeTable() {
    const tbody = document.getElementById("collegeTableBody");
    if (!tbody) return;
    tbody.innerHTML = TABLE_COLLEGES.map(c => `
    <tr>
      <td>${c.rank}</td>
      <td><span class="table-school-name">${c.name}</span></td>
      <td><span class="table-avg">${c.avg}</span></td>
      <td><span class="table-high">${c.high}</span></td>
      <td><span class="table-cutoff-badge">${c.cutoff}</span></td>
      <td><span class="table-exam-tag">${c.exam}</span></td>
    </tr>`).join("");
}

/* ============================================================
   FORM VALIDATION
   ============================================================ */
function validate() {
    let valid = true;
    const required = ["catPercentile", "category", "gender", "tenth", "twelfth", "stream"];

    required.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.remove("error");
        if (!el.value || el.value.trim() === "") {
            el.classList.add("error");
            valid = false;
        }
    });

    const pct = parseFloat(document.getElementById("catPercentile").value);
    if (!isNaN(pct) && (pct < 0 || pct > 100)) {
        document.getElementById("catPercentile").classList.add("error");
        valid = false;
    }

    return valid;
}

/* ============================================================
   TAB MANAGEMENT
   ============================================================ */
let currentResults = { safe: [], moderate: [], reach: [] };
let activeTab = "all";

function renderTab(tab) {
    activeTab = tab;
    const list = document.getElementById("resultsList");
    if (!list) return;

    let colleges;
    if (tab === "safe") colleges = currentResults.safe;
    else if (tab === "moderate") colleges = currentResults.moderate;
    else if (tab === "reach") colleges = currentResults.reach;
    else colleges = [...currentResults.safe, ...currentResults.moderate, ...currentResults.reach];

    list.innerHTML = renderColleges(colleges);
}

function bindTabs() {
    document.querySelectorAll(".rtab").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".rtab").forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            renderTab(this.dataset.tier);
        });
    });
}

/* ============================================================
   PREDICT BUTTON
   ============================================================ */
function runPrediction() {
    if (!validate()) {
        // Scroll to first error
        const firstErr = document.querySelector(".pred-input.error");
        if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
    }

    const percentile = document.getElementById("catPercentile").value;
    const category = document.getElementById("category").value;
    const gender = document.getElementById("gender").value;
    const tenth = document.getElementById("tenth").value;
    const twelfth = document.getElementById("twelfth").value;
    const grad = document.getElementById("grad").value;
    const stream = document.getElementById("stream").value;
    const workex = document.getElementById("workex").value;

    // Run engine
    const results = predict(percentile, category, gender, tenth, twelfth, grad, stream, workex);
    currentResults = results;

    // Show results panel
    document.getElementById("resultsPlaceholder").style.display = "none";
    const content = document.getElementById("resultsContent");
    content.style.display = "block";

    // Summary
    document.getElementById("resultsSummary").innerHTML =
        buildSummaryCard(results.safe, results.moderate, results.reach, percentile, category);

    // Reset tabs to "all"
    document.querySelectorAll(".rtab").forEach(b => b.classList.remove("active"));
    const allTab = document.querySelector('.rtab[data-tier="all"]');
    if (allTab) allTab.classList.add("active");

    renderTab("all");

    // Scroll results into view on mobile
    if (window.innerWidth < 900) {
        document.getElementById("resultsPanel").scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
    // Wire predict button
    const btn = document.getElementById("predictBtn");
    if (btn) btn.addEventListener("click", runPrediction);

    // Allow Enter key on inputs
    document.querySelectorAll(".pred-input").forEach(inp => {
        inp.addEventListener("keydown", function (e) {
            if (e.key === "Enter") runPrediction();
        });
        // Clear error on type
        inp.addEventListener("input", function () {
            this.classList.remove("error");
        });
    });

    // Wire result tabs
    bindTabs();

    // Build college table
    buildCollegeTable();
});