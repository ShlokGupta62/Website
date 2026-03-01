/**
 * popup.js – Hackathon Monitor extension popup
 *
 * Talks directly to the backend (configurable in Options).
 * Default: http://localhost:5000
 */

const DEFAULT_API = "http://localhost:5001";
const DEFAULT_FRONTEND = "http://localhost:3000";

let hackathons = [];
let selectedId = null;
let backendUrl = DEFAULT_API;
let frontendUrl = DEFAULT_FRONTEND;

// ── DOM refs ──────────────────────────────────────
const $loading        = document.getElementById("loading");
const $noHackathons   = document.getElementById("no-hackathons");
const $mainContent    = document.getElementById("main-content");
const $banner         = document.getElementById("connection-banner");
const $select         = document.getElementById("hackathon-select");
const $meta           = document.getElementById("hackathon-meta");
const $pills          = document.getElementById("summary-pills");
const $teamList       = document.getElementById("team-list");
const $lastUpdate     = document.getElementById("last-update");
const $btnRefresh     = document.getElementById("btn-refresh");
const $btnOptions     = document.getElementById("btn-options");
const $btnParticipant = document.getElementById("btn-participant");
const $btnJudge       = document.getElementById("btn-judge");

// ── Utility ───────────────────────────────────────
async function apiFetch(path) {
  const res = await fetch(`${backendUrl}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function show(el)  { el.classList.remove("hidden"); }
function hide(el)  { el.classList.add("hidden"); }

function verdictClass(verdict = "") {
  if (verdict === "PURE") return "verdict-pure";
  if (verdict === "SUSPICIOUS") return "verdict-suspect";
  if (verdict === "CHEATING") return "verdict-cheating";
  return "verdict-unknown";
}

function hackathonStatus(h) {
  const now = Date.now();
  const start = new Date(h.startTime).getTime();
  const end   = new Date(h.endTime).getTime();
  if (now < start) return { label: "Upcoming", cls: "badge-upcoming" };
  if (now > end)   return { label: "Ended",    cls: "badge-past" };
  return { label: "Active", cls: "badge-active" };
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

function scoreColor(score) {
  if (score >= 75) return "#3fb950";
  if (score >= 45) return "#e3b341";
  return "#f85149";
}

// ── SVG ring for team score ───────────────────────
function scoreSVG(score, color) {
  const r = 14, sw = 3;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return `<svg width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="${r}" fill="none" stroke="#21262d" stroke-width="${sw}"/>
    <circle cx="18" cy="18" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"
      stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
      stroke-linecap="round" transform="rotate(-90 18 18)"
      style="transition:stroke-dashoffset 0.5s ease"/>
    <text x="18" y="18" text-anchor="middle" dominant-baseline="central"
      fill="${color}" font-size="9" font-weight="700">${score}</text>
  </svg>`;
}

// ── Render overview for selected hackathon ────────
function renderOverview(overview) {
  const { hackathon, teams } = overview;

  // Meta bar
  const status = hackathonStatus(hackathon);
  $meta.innerHTML = `
    <span class="status-badge ${status.cls}">${status.label}</span>
    <span>${fmtDate(hackathon.startTime)} → ${fmtDate(hackathon.endTime)}</span>
    ${hackathon.venue?.label ? `<span>📍 ${hackathon.venue.label}</span>` : ""}
  `;

  // Pills
  const total   = teams.length;
  const flagged = teams.filter((t) => t.flagged).length;
  const pure    = teams.filter((t) => !t.flagged).length;
  const totalCommits = teams.reduce((s, t) => s + t.totalCommits, 0);
  $pills.innerHTML = `
    <span class="pill">${total} team${total !== 1 ? "s" : ""}</span>
    <span class="pill pill-green">✅ ${pure} clean</span>
    ${flagged > 0 ? `<span class="pill pill-red">🚩 ${flagged} flagged</span>` : ""}
    <span class="pill">${totalCommits} commits</span>
  `;

  // Team rows
  $teamList.innerHTML = "";
  if (!teams.length) {
    $teamList.innerHTML = `<div class="centered" style="padding:12px">No teams found.</div>`;
    return;
  }

  // Sort: flagged first, then by score desc
  const sorted = [...teams].sort((a, b) => {
    if (a.flagged !== b.flagged) return a.flagged ? -1 : 1;
    return (b.integrity?.totalScore ?? 0) - (a.integrity?.totalScore ?? 0);
  });

  for (const team of sorted) {
    const score   = team.integrity?.totalScore ?? 0;
    const verdict = team.integrity?.verdict ?? "—";
    const color   = scoreColor(score);
    const row = document.createElement("div");
    row.className = "team-row";
    row.innerHTML = `
      <div class="team-score-ring">${scoreSVG(score, color)}</div>
      <div class="team-info">
        <div class="team-name">${team.teamName}</div>
        <div class="team-sub">${team.totalCommits} commit${team.totalCommits !== 1 ? "s" : ""}
          · ⏱ ${team.validTime ?? 0} valid
          ${team.outside > 0 ? `· 📍 ${team.outside} outside` : ""}
        </div>
      </div>
      <span class="verdict-tag ${verdictClass(verdict)}">${verdict}</span>
    `;
    $teamList.appendChild(row);
  }
}

// ── Load hackathon overview ───────────────────────
async function loadOverview(hackathonId) {
  try {
    const overview = await apiFetch(`/api/judge/hackathon/${hackathonId}/overview`);
    hide($loading);
    show($mainContent);
    hide($banner);
    renderOverview(overview);
    $lastUpdate.textContent = `Updated ${new Date().toLocaleTimeString()}`;

    // Persist to storage for background to use
    chrome.storage.local.set({ lastOverview: overview, lastOverviewTs: Date.now() });
  } catch (err) {
    hide($loading);
    show($banner);
    show($mainContent);
    $lastUpdate.textContent = "Failed to fetch overview";
    console.error("[popup] overview error:", err);
  }
}

// ── Populate hackathon selector ───────────────────
function populateSelect(hackathonList) {
  $select.innerHTML = "";
  for (const h of hackathonList) {
    const opt = document.createElement("option");
    opt.value = h._id;
    opt.textContent = h.name;
    $select.appendChild(opt);
  }
}

// ── Main init ─────────────────────────────────────
async function init() {
  // Load config
  const stored = await chrome.storage.sync.get(["backendUrl", "frontendUrl"]);
  if (stored.backendUrl) backendUrl = stored.backendUrl;
  if (stored.frontendUrl) frontendUrl = stored.frontendUrl;

  show($loading);
  hide($mainContent);
  hide($noHackathons);
  hide($banner);

  try {
    hackathons = await apiFetch("/api/hackathons");
  } catch (err) {
    hide($loading);
    show($banner);
    show($noHackathons);
    console.error("[popup] Cannot reach backend:", err);
    return;
  }

  hide($loading);

  if (!hackathons.length) {
    show($noHackathons);
    return;
  }

  populateSelect(hackathons);
  show($mainContent);

  // Restore last-selected hackathon
  const saved = await chrome.storage.local.get("selectedHackathonId");
  const lastId = saved.selectedHackathonId;
  if (lastId && hackathons.find((h) => h._id === lastId)) {
    $select.value = lastId;
    selectedId = lastId;
  } else {
    selectedId = hackathons[0]._id;
    $select.value = selectedId;
  }

  await loadOverview(selectedId);
}

// ── Event listeners ───────────────────────────────
$select.addEventListener("change", async () => {
  selectedId = $select.value;
  chrome.storage.local.set({ selectedHackathonId: selectedId });
  hide($mainContent);
  show($loading);
  await loadOverview(selectedId);
});

$btnRefresh.addEventListener("click", async () => {
  $btnRefresh.style.opacity = "0.4";
  await loadOverview(selectedId || $select.value);
  $btnRefresh.style.opacity = "1";
});

$btnOptions.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

$btnParticipant.addEventListener("click", () => {
  chrome.tabs.create({ url: `${frontendUrl}/` });
});

$btnJudge.addEventListener("click", () => {
  chrome.tabs.create({ url: `${frontendUrl}/judge` });
});

// ── Boot ──────────────────────────────────────────
init();
