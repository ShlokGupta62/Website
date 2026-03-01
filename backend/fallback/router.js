/**
 * backend/fallback/router.js
 *
 * Express router that handles every API route the frontend calls,
 * returning data from staticData.js when MongoDB is unavailable.
 *
 * Mounted BEFORE the real route handlers in server.js.
 * Skipped entirely (next()) when the DB is connected.
 */

"use strict";

const express = require("express");
const router  = express.Router();
const sd      = require("./staticData");

// ── Guard: only use this router when DB is down ─────────────────────────────
// server.js sets res.locals.useStaticData = true when DB fails.
router.use((req, res, next) => {
  if (!res.locals.useStaticData) return next("router"); // pass to real routes
  next();
});

// ── Health ───────────────────────────────────────────────────────────────────
router.get("/api/health", (_req, res) =>
  res.json({ status: "ok", mode: "static-demo" })
);

// ── Hackathons ───────────────────────────────────────────────────────────────
router.get("/api/hackathons", (_req, res) => res.json([sd.HACKATHON]));

router.get("/api/hackathons/:id", (req, res) => {
  if (req.params.id === sd.H_ID) return res.json(sd.HACKATHON);
  res.status(404).json({ error: "Not found" });
});

// ── Teams ────────────────────────────────────────────────────────────────────
router.get("/api/teams", (_req, res) =>
  res.json(sd.TEAMS.map(t => ({ ...t, hackathon: sd.HACKATHON })))
);

router.get("/api/teams/:id", (req, res) => {
  const t = sd.TEAMS.find(t => t._id === req.params.id);
  if (!t) return res.status(404).json({ error: "Not found" });
  res.json({ ...t, hackathon: sd.HACKATHON });
});

// ── Judge overview ───────────────────────────────────────────────────────────
router.get("/api/judge/hackathon/:hackathonId/overview", (req, res) => {
  if (req.params.hackathonId !== sd.H_ID)
    return res.status(404).json({ error: "Hackathon not found" });
  res.json(sd.JUDGE_OVERVIEW);
});

router.get("/api/judge/team/:teamId/commits", (req, res) => {
  const commits = sd.ALL_COMMITS
    .filter(c => c.team === req.params.teamId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(commits);
});

// ── Participant ──────────────────────────────────────────────────────────────
router.get("/api/participant/commits", (req, res) => {
  const { team } = req.query;
  if (!team) return res.status(400).json({ error: "team query param required" });
  const commits = sd.ALL_COMMITS
    .filter(c => c.team === team)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(commits);
});

router.get("/api/participant/summary", (req, res) => {
  const { team: teamId } = req.query;
  if (!teamId) return res.status(400).json({ error: "team query param required" });

  const team     = sd.TEAMS.find(t => t._id === teamId);
  if (!team) return res.status(404).json({ error: "Team not found" });

  const commits    = sd.ALL_COMMITS.filter(c => c.team === teamId);
  const validTime  = commits.filter(c => c.timeValid === true).length;
  const invalidTime= commits.filter(c => c.timeValid === false).length;
  const onSite     = commits.filter(c => c.locationStatus === "on-site").length;
  const outside    = commits.filter(c => c.locationStatus === "outside").length;
  const unknown    = commits.filter(c => c.locationStatus === "unknown").length;

  const integrityMap = {
    [sd.T1_ID]: sd.INTEGRITY_T1,
    [sd.T2_ID]: sd.INTEGRITY_T2,
    [sd.T3_ID]: sd.INTEGRITY_T3,
  };

  res.json({
    team:     team.name,
    repo:     team.repoFullName,
    hackathon: sd.HACKATHON.name,
    hackathonWindow: { start: sd.HACKATHON.startTime, end: sd.HACKATHON.endTime },
    totalCommits: commits.length,
    timeBreakdown:     { valid: validTime, invalid: invalidTime },
    locationBreakdown: { onSite, outside, unknown },
    integrity: integrityMap[teamId] || null,
  });
});

router.post("/api/participant/location", (req, res) =>
  res.json({ locationStatus: "on-site", updatedCommits: 0 })
);

// ── Tasks ─────────────────────────────────────────────────────────────────────
router.get("/api/tasks", (req, res) => {
  let tasks = sd.TASKS;
  if (req.query.team)     tasks = tasks.filter(t => t.team === req.query.team);
  if (req.query.hackathon)tasks = tasks.filter(t => t.hackathon === req.query.hackathon);
  res.json(tasks);
});

router.post("/api/tasks", (req, res) =>
  res.status(201).json({
    _id: `65f0000000000000000099${Date.now()}`,
    ...req.body,
    completed: false,
    createdAt: new Date().toISOString(),
  })
);

router.patch("/api/tasks/:id", (req, res) => res.json({ _id: req.params.id, ...req.body }));
router.delete("/api/tasks/:id", (req, res) => res.json({ deleted: true }));

// ── Remarks / Scoring criteria ────────────────────────────────────────────────
router.get("/api/remarks/criteria", (req, res) => {
  if (req.query.hackathon !== sd.H_ID)
    return res.json({ hackathon: req.query.hackathon, sections: [] });
  res.json(sd.SCORING_CRITERIA);
});

router.put("/api/remarks/criteria", (req, res) => res.json({ ...sd.SCORING_CRITERIA, ...req.body }));

router.get("/api/remarks/scores/team/:teamId", (req, res) => {
  const remark = sd.REMARKS[req.params.teamId];
  if (!remark) return res.json(null);
  res.json(remark);
});

router.put("/api/remarks/scores/team/:teamId", (req, res) =>
  res.json({ ...sd.REMARKS[req.params.teamId], ...req.body })
);

// ── Sync (no-op in demo mode) ─────────────────────────────────────────────────
router.post("/api/sync/hackathon/:id", (_req, res) =>
  res.json({ synced: 0, message: "demo mode – no live sync" })
);
router.post("/api/sync/team/:id", (_req, res) =>
  res.json({ synced: 0, message: "demo mode – no live sync" })
);

// ── Geolocation fallback ──────────────────────────────────────────────────────
router.get("/api/geolocation", (_req, res) =>
  res.json({ latitude: 22.5726, longitude: 88.3639, city: "Kolkata", region: "WB", country: "India", source: "demo" })
);

module.exports = router;
