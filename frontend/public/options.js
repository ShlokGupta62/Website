/**
 * options.js – settings page for Hackathon Monitor extension
 */

const DEFAULT_BACKEND  = "http://localhost:5001";
const DEFAULT_FRONTEND = "http://localhost:3000";
const DEFAULT_INTERVAL = 30;

const $backendUrl   = document.getElementById("backend-url");
const $frontendUrl  = document.getElementById("frontend-url");
const $pollInterval = document.getElementById("poll-interval");
const $notifyToggle = document.getElementById("notify-toggle");
const $saveBtn      = document.getElementById("save-btn");
const $resetBtn     = document.getElementById("reset-btn");
const $statusMsg    = document.getElementById("status-msg");
const $testBtn      = document.getElementById("test-btn");
const $testResult   = document.getElementById("test-result");
const $stLastPoll   = document.getElementById("st-last-poll");
const $stFlagged    = document.getElementById("st-flagged");
const $stVersion    = document.getElementById("st-version");

// ── Load saved settings ────────────────────────────
async function loadSettings() {
  const s = await chrome.storage.sync.get([
    "backendUrl",
    "frontendUrl",
    "pollInterval",
    "notificationsEnabled",
  ]);
  $backendUrl.value   = s.backendUrl   || DEFAULT_BACKEND;
  $frontendUrl.value  = s.frontendUrl  || DEFAULT_FRONTEND;
  $pollInterval.value = s.pollInterval || DEFAULT_INTERVAL;
  $notifyToggle.checked = s.notificationsEnabled !== false; // default true
}

// ── Save settings ──────────────────────────────────
document.getElementById("settings-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const interval = parseInt($pollInterval.value, 10);
  if (interval < 15) {
    showStatus("Poll interval must be at least 15 seconds.", "error");
    return;
  }

  await chrome.storage.sync.set({
    backendUrl:            $backendUrl.value.trim().replace(/\/$/, ""),
    frontendUrl:           $frontendUrl.value.trim().replace(/\/$/, ""),
    pollInterval:          interval,
    notificationsEnabled:  $notifyToggle.checked,
  });

  // Ask background to restart alarm with new interval
  chrome.runtime.sendMessage({ type: "POLL_NOW" }).catch(() => {});

  showStatus("Settings saved ✓", "success");
});

// ── Reset defaults ─────────────────────────────────
$resetBtn.addEventListener("click", async () => {
  if (!confirm("Reset all settings to defaults?")) return;
  await chrome.storage.sync.set({
    backendUrl:           DEFAULT_BACKEND,
    frontendUrl:          DEFAULT_FRONTEND,
    pollInterval:         DEFAULT_INTERVAL,
    notificationsEnabled: true,
  });
  loadSettings();
  showStatus("Reset to defaults.", "success");
});

// ── Test connection ────────────────────────────────
$testBtn.addEventListener("click", async () => {
  const url = ($backendUrl.value || DEFAULT_BACKEND).replace(/\/$/, "");
  $testBtn.disabled = true;
  $testBtn.textContent = "Testing…";
  $testResult.className = "test-result hidden";

  try {
    const t0 = Date.now();
    const res = await fetch(`${url}/api/hackathons`);
    const ms = Date.now() - t0;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    $testResult.textContent =
      `✅ Connected in ${ms} ms\n` +
      `Found ${data.length} hackathon${data.length !== 1 ? "s" : ""}`;
    $testResult.className = "test-result ok";
  } catch (err) {
    $testResult.textContent = `❌ ${err.message}\nCheck that the backend is running at:\n${url}`;
    $testResult.className = "test-result err";
  } finally {
    $testBtn.disabled = false;
    $testBtn.textContent = "Test Connection";
    $testResult.classList.remove("hidden");
  }
});

// ── Status panel ───────────────────────────────────
async function loadStatus() {
  const manifest = chrome.runtime.getManifest();
  $stVersion.textContent = manifest.version;

  const local = await chrome.storage.local.get(["lastPollTs", "prevFlagged"]);

  if (local.lastPollTs) {
    const d = new Date(local.lastPollTs);
    $stLastPoll.textContent = d.toLocaleString();
  }

  const flaggedKeys = Object.keys(local.prevFlagged || {});
  if (flaggedKeys.length === 0) {
    $stFlagged.textContent = "None";
    $stFlagged.style.color = "#3fb950";
  } else {
    $stFlagged.textContent = flaggedKeys.length + " team(s)";
    $stFlagged.style.color = "#f85149";
  }
}

// ── Helpers ────────────────────────────────────────
function showStatus(msg, type) {
  $statusMsg.textContent = msg;
  $statusMsg.className = `status-msg ${type}`;
  setTimeout(() => { $statusMsg.className = "status-msg hidden"; }, 3000);
}

// ── Boot ───────────────────────────────────────────
loadSettings();
loadStatus();
