/**
 * content.js – content script injected into the Hackathon Monitor
 * frontend (localhost:3000).
 *
 * Adds a subtle floating badge in the bottom-right corner to indicate
 * the extension is active and shows the last-known flagged count.
 */

(function () {
  "use strict";

  // Only run once
  if (document.getElementById("hackmon-ext-badge")) return;

  const badge = document.createElement("div");
  badge.id = "hackmon-ext-badge";
  Object.assign(badge.style, {
    position: "fixed",
    bottom: "12px",
    right: "12px",
    zIndex: "99999",
    background: "#161b22",
    border: "1px solid #30363d",
    borderRadius: "20px",
    padding: "4px 10px",
    fontSize: "11px",
    fontFamily: "monospace",
    color: "#8b949e",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
    transition: "opacity 0.3s",
    userSelect: "none",
  });
  badge.title = "Hackathon Monitor Extension – click to dismiss";
  badge.textContent = "🟡 HackMon active";

  badge.addEventListener("click", () => {
    badge.style.opacity = "0";
    setTimeout(() => badge.remove(), 400);
  });

  document.body.appendChild(badge);

  // Update badge with flagged count from storage
  function updateBadge() {
    chrome.storage.local.get(["prevFlagged", "lastPollTs"], (data) => {
      const flaggedKeys = Object.keys(data.prevFlagged || {});
      if (flaggedKeys.length > 0) {
        badge.style.color = "#f85149";
        badge.style.borderColor = "#f85149";
        badge.textContent = `🚩 HackMon: ${flaggedKeys.length} team${flaggedKeys.length > 1 ? "s" : ""} flagged`;
      } else {
        badge.style.color = "#3fb950";
        badge.style.borderColor = "#3fb950";
        badge.textContent = "✅ HackMon: all clear";
      }
    });
  }

  updateBadge();

  // Listen for storage changes to update badge live
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.prevFlagged) {
      updateBadge();
    }
  });
})();
