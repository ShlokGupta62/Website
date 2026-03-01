/**
 * background.js – Service Worker for Hackathon Monitor extension
 *
 * Polls the backend on a configurable interval, updates the
 * action badge, and fires desktop notifications when teams are flagged.
 */

const DEFAULT_API      = "http://localhost:5001";
const DEFAULT_INTERVAL = 30; // seconds
const ALARM_NAME       = "hackmon-poll";

// ── Helpers ───────────────────────────────────────
async function getConfig() {
  const s = await chrome.storage.sync.get(["backendUrl", "pollInterval"]);
  return {
    backendUrl:   s.backendUrl   || DEFAULT_API,
    pollInterval: parseInt(s.pollInterval || DEFAULT_INTERVAL, 10),
  };
}

async function apiFetch(base, path) {
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function isActive(h) {
  const now = Date.now();
  return now >= new Date(h.startTime).getTime() &&
         now <= new Date(h.endTime).getTime();
}

// ── Badge helpers ─────────────────────────────────
function setBadge(flaggedCount) {
  if (flaggedCount === 0) {
    chrome.action.setBadgeText({ text: "" });
    return;
  }
  chrome.action.setBadgeText({ text: String(flaggedCount) });
  chrome.action.setBadgeBackgroundColor({ color: "#f85149" });
}

// ── Notification helpers ──────────────────────────
async function maybeNotify(teamName, hackathonName, verdict) {
  // Check permission
  if (Notification.permission !== "granted") return;
  chrome.notifications.create(`flag-${teamName}`, {
    type: "basic",
    iconUrl: "icons/icon48.png",
    title: `🚩 ${teamName} flagged`,
    message: `Verdict: ${verdict} · Hackathon: ${hackathonName}`,
    priority: 2,
  });
}

// ── Core poll logic ───────────────────────────────
async function poll() {
  const { backendUrl } = await getConfig();

  let hackathons;
  try {
    hackathons = await apiFetch(backendUrl, "/api/hackathons");
  } catch (err) {
    console.warn("[bg] Cannot reach backend:", err.message);
    setBadge(0);
    chrome.action.setBadgeText({ text: "!" });
    chrome.action.setBadgeBackgroundColor({ color: "#8b949e" });
    return;
  }

  // Only check active hackathons
  const activeHackathons = hackathons.filter(isActive);
  if (!activeHackathons.length) {
    setBadge(0);
    return;
  }

  // Get previous flagged state
  const { prevFlagged = {} } = await chrome.storage.local.get("prevFlagged");

  let totalFlagged = 0;
  const newFlagged = {};

  for (const h of activeHackathons) {
    let overview;
    try {
      overview = await apiFetch(backendUrl, `/api/judge/hackathon/${h._id}/overview`);
    } catch {
      continue;
    }

    for (const team of overview.teams || []) {
      const key = `${h._id}:${team.teamId}`;
      if (team.flagged) {
        totalFlagged++;
        newFlagged[key] = { team: team.teamName, hackathon: h.name, verdict: team.integrity?.verdict };
        // Notify if newly flagged (wasn't flagged in previous poll)
        if (!prevFlagged[key]) {
          await maybeNotify(team.teamName, h.name, team.integrity?.verdict || "SUSPICIOUS");
        }
      }
    }
  }

  await chrome.storage.local.set({ prevFlagged: newFlagged, lastPollTs: Date.now() });
  setBadge(totalFlagged);
}

// ── Alarm management ──────────────────────────────
async function resetAlarm() {
  const { pollInterval } = await getConfig();
  await chrome.alarms.clearAll();
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: pollInterval / 60,
    periodInMinutes: pollInterval / 60,
  });
}

// ── Event listeners ───────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  console.log("[bg] Hackathon Monitor installed — starting poll alarm.");
  chrome.action.setBadgeText({ text: "" });
  resetAlarm();
  poll(); // immediate first poll
});

chrome.runtime.onStartup.addListener(() => {
  resetAlarm();
  poll();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) poll();
});

// Re-create alarm when settings change
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && (changes.pollInterval || changes.backendUrl)) {
    resetAlarm();
  }
});

// Allow popup / options to trigger a manual poll
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "POLL_NOW") {
    poll().then(() => sendResponse({ ok: true }));
    return true; // async
  }
});

// ── Keyboard command shortcuts ────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  const s = await chrome.storage.sync.get("frontendUrl");
  const frontend = (s.frontendUrl || "http://localhost:3000").replace(/\/$/, "");
  if (command === "open-participant-dashboard") {
    chrome.tabs.create({ url: `${frontend}/` });
  } else if (command === "open-judge-dashboard") {
    chrome.tabs.create({ url: `${frontend}/judge` });
  }
});
