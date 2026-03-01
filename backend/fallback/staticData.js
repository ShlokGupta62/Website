/**
 * backend/fallback/staticData.js
 *
 * Hard-coded demo data returned when MongoDB is unavailable (e.g. Vercel
 * deployment without Atlas configured).  Mirrors the exact shapes that
 * every API route returns so the React dashboards render identically to
 * a live-DB environment.
 */

"use strict";

// ── Fixed IDs ────────────────────────────────────────────────────────────────
const H_ID  = "65f0000000000000000000a1"; // hackathon
const T1_ID = "65f0000000000000000000b1"; // Alpha Coders
const T2_ID = "65f0000000000000000000b2"; // Debug Squad
const T3_ID = "65f0000000000000000000b3"; // Neural Ninjas

// ── Hackathon ────────────────────────────────────────────────────────────────
const HACKATHON = {
  _id: H_ID,
  name: "Diversion 2026",
  description: "48-hour on-site hackathon",
  startTime: "2026-02-27T09:00:00.000Z",
  endTime:   "2026-03-02T09:00:00.000Z",
  venue: { label: "IEM Kolkata", latitude: 22.5726, longitude: 88.3639, radiusKm: 5 },
  status: "active",
  __v: 0,
};

// ── Teams ────────────────────────────────────────────────────────────────────
const TEAM1 = {
  _id: T1_ID,
  name: "Alpha Coders",
  repoFullName: "priyanshu22102006/luffy-web",
  members: ["alice", "bob", "charlie"],
  hackathon: H_ID,
  __v: 0,
};
const TEAM2 = {
  _id: T2_ID,
  name: "Debug Squad",
  repoFullName: "priyanshu22102006/Coding",
  members: ["dave", "eve"],
  hackathon: H_ID,
  __v: 0,
};
const TEAM3 = {
  _id: T3_ID,
  name: "Neural Ninjas",
  repoFullName: "priyanshu22102006/neural-project",
  members: ["frank", "grace", "henry"],
  hackathon: H_ID,
  __v: 0,
};
const TEAMS = [TEAM1, TEAM2, TEAM3];

// ── Helper to build a commit object ─────────────────────────────────────────
let _cid = 1;
function mkCommit(teamId, sha, msg, isoTime, timeValid, locStatus, lat, lng) {
  const id = `65f00000000000000000c${String(_cid++).padStart(3, "0")}`;
  return {
    _id: id,
    sha,
    message: msg,
    author: ["alice","bob","charlie","dave","eve","frank","grace","henry"][_cid % 8],
    timestamp: isoTime,
    timeValid,
    hackathon: H_ID,
    team: teamId,
    location: { latitude: lat, longitude: lng, city: "Kolkata", region: "WB", country: "India" },
    locationStatus: locStatus,
    url: `https://github.com/team/repo/commit/${sha}`,
    __v: 0,
  };
}

// ── Commits – Team 1 (Alpha Coders, mostly clean) ───────────────────────────
const COMMITS_T1 = [
  mkCommit(T1_ID,"a1b2c3d","Initial project scaffold","2026-02-27T10:15:00.000Z",true,"on-site",22.573,88.364),
  mkCommit(T1_ID,"b2c3d4e","Add homepage layout","2026-02-27T12:30:00.000Z",true,"on-site",22.573,88.364),
  mkCommit(T1_ID,"c3d4e5f","Implement auth flow","2026-02-27T15:45:00.000Z",true,"on-site",22.572,88.365),
  mkCommit(T1_ID,"d4e5f6a","Add API routes","2026-02-27T18:20:00.000Z",true,"on-site",22.573,88.363),
  mkCommit(T1_ID,"e5f6a7b","Fix CORS issue","2026-02-27T22:10:00.000Z",true,"on-site",22.574,88.364),
  mkCommit(T1_ID,"f6a7b8c","Database integration","2026-02-28T03:30:00.000Z",true,"on-site",22.572,88.366),
  mkCommit(T1_ID,"a7b8c9d","Add user profiles","2026-02-28T09:15:00.000Z",true,"on-site",22.573,88.364),
  mkCommit(T1_ID,"b8c9d0e","UI polish + dark mode","2026-02-28T13:40:00.000Z",true,"on-site",22.574,88.363),
  mkCommit(T1_ID,"c9d0e1f","Mobile responsive layout","2026-02-28T17:55:00.000Z",true,"on-site",22.572,88.365),
  mkCommit(T1_ID,"d0e1f2a","Unit tests","2026-02-28T21:00:00.000Z",true,"on-site",22.573,88.364),
  mkCommit(T1_ID,"e1f2a3b","Bug fixes from testing","2026-03-01T00:30:00.000Z",true,"on-site",22.573,88.364),
  mkCommit(T1_ID,"f2a3b4c","Performance optimizations","2026-03-01T08:45:00.000Z",true,"on-site",22.572,88.366),
  mkCommit(T1_ID,"a3b4c5d","Final UI cleanup","2026-03-01T14:20:00.000Z",true,"on-site",22.574,88.364),
  mkCommit(T1_ID,"b4c5d6e","Deployment scripts","2026-03-01T19:10:00.000Z",true,"on-site",22.573,88.363),
  mkCommit(T1_ID,"c5d6e7f","README and docs","2026-03-01T23:50:00.000Z",true,"on-site",22.573,88.364),
];

// ── Commits – Team 2 (Debug Squad, suspicious: 2 outside + 1 post-window) ───
const COMMITS_T2 = [
  mkCommit(T2_ID,"d6e7f8a","Project init","2026-02-27T11:00:00.000Z",true,"on-site",22.573,88.364),
  mkCommit(T2_ID,"e7f8a9b","Backend skeleton","2026-02-27T14:30:00.000Z",true,"on-site",22.574,88.363),
  mkCommit(T2_ID,"f8a9b0c","Add ML model integration","2026-02-27T20:00:00.000Z",true,"outside",12.971,77.594),
  mkCommit(T2_ID,"a9b0c1d","Frontend components","2026-02-28T02:15:00.000Z",true,"on-site",22.573,88.364),
  mkCommit(T2_ID,"b0c1d2e","API wiring","2026-02-28T10:00:00.000Z",true,"on-site",22.572,88.365),
  mkCommit(T2_ID,"c1d2e3f","Data pipeline","2026-02-28T16:45:00.000Z",true,"outside",12.972,77.595),
  mkCommit(T2_ID,"d2e3f4a","Dashboard charts","2026-03-01T07:30:00.000Z",true,"on-site",22.573,88.364),
  mkCommit(T2_ID,"e3f4a5b","Login & register","2026-03-01T13:00:00.000Z",true,"on-site",22.574,88.364),
  mkCommit(T2_ID,"f4a5b6c","Final integration","2026-03-01T22:40:00.000Z",true,"on-site",22.573,88.363),
  mkCommit(T2_ID,"a5b6c7d","Post-hackathon hotfix","2026-03-02T11:00:00.000Z",false,"unknown",0,0),
];

// ── Commits – Team 3 (Neural Ninjas, clean) ──────────────────────────────────
const COMMITS_T3 = [
  mkCommit(T3_ID,"b6c7d8e","Repo initialized","2026-02-27T09:30:00.000Z",true,"on-site",22.573,88.364),
  mkCommit(T3_ID,"c7d8e9f","Architecture design docs","2026-02-27T13:10:00.000Z",true,"on-site",22.572,88.366),
  mkCommit(T3_ID,"d8e9f0a","Core algorithm impl","2026-02-27T17:00:00.000Z",true,"on-site",22.574,88.364),
  mkCommit(T3_ID,"e9f0a1b","REST API scaffold","2026-02-27T23:20:00.000Z",true,"on-site",22.573,88.364),
  mkCommit(T3_ID,"f0a1b2c","React SPA bootstrap","2026-02-28T05:00:00.000Z",true,"on-site",22.573,88.363),
  mkCommit(T3_ID,"a1b2c3e","Integrate dataset","2026-02-28T11:30:00.000Z",true,"on-site",22.574,88.365),
  mkCommit(T3_ID,"b2c3d4f","Realtime updates via SSE","2026-02-28T15:10:00.000Z",true,"on-site",22.572,88.364),
  mkCommit(T3_ID,"c3d4e5a","Add visualizations","2026-02-28T20:45:00.000Z",true,"on-site",22.573,88.364),
  mkCommit(T3_ID,"d4e5f6b","Accessibility fixes","2026-03-01T06:00:00.000Z",true,"on-site",22.573,88.364),
  mkCommit(T3_ID,"e5f6a7c","E2E tests","2026-03-01T11:20:00.000Z",true,"on-site",22.574,88.363),
  mkCommit(T3_ID,"f6a7b8d","Polish and demo prep","2026-03-01T16:50:00.000Z",true,"on-site",22.572,88.366),
  mkCommit(T3_ID,"a7b8c9e","Final submission","2026-03-01T21:30:00.000Z",true,"on-site",22.573,88.364),
];

const ALL_COMMITS = [...COMMITS_T1, ...COMMITS_T2, ...COMMITS_T3];

// ── Integrity scores ──────────────────────────────────────────────────────────
function mkIntegrity(score, verdict, t, i, lc, oc, rCount) {
  const color = verdict === "PURE" ? "#3fb950" : verdict === "SUSPICIOUS" ? "#e3b341" : "#f85149";
  return {
    totalScore: score,
    verdict,
    verdictColor: color,
    repoStatus: verdict === "PURE" ? "ACTIVE_STEADY" : "BURST_DETECTED",
    repoStatusColor: color,
    time:   { score: t, issues: [] },
    location: { score: lc, issues: oc > 0 ? [`${oc} commit(s) from outside venue`] : [] },
    frequencyCurve: { score: 80, issues: [] },
    metricPadding:  { score: i, issues: [] },
    codeDump:       { score: 85, issues: [] },
  };
}

const INTEGRITY_T1 = mkIntegrity(82, "PURE",       90, 80, 95, 0, 15);
const INTEGRITY_T2 = mkIntegrity(55, "SUSPICIOUS",  70, 65, 60, 2, 10);
const INTEGRITY_T3 = mkIntegrity(78, "PURE",       85, 75, 90, 0, 12);

// ── Scoring criteria & remarks ────────────────────────────────────────────────
const SCORING_CRITERIA = {
  hackathon: H_ID,
  sections: [
    { name: "Innovation",    maxMarks: 25 },
    { name: "Technical Depth", maxMarks: 25 },
    { name: "UI/UX",         maxMarks: 20 },
    { name: "Presentation",  maxMarks: 15 },
    { name: "Code Quality",  maxMarks: 15 },
  ],
};

function mkRemark(teamId, scores, remarks) {
  return {
    _id: `65f00000000000000000e${teamId.slice(-1)}01`,
    hackathon: H_ID,
    team: teamId,
    scores,
    totalMarks: scores.reduce((s, sc) => s + sc.marks, 0),
    maxTotalMarks: scores.reduce((s, sc) => s + sc.maxMarks, 0),
    remarks,
    __v: 0,
  };
}

const REMARKS = {
  [T1_ID]: mkRemark(T1_ID, [
    { sectionName:"Innovation",     maxMarks:25, marks:21 },
    { sectionName:"Technical Depth",maxMarks:25, marks:22 },
    { sectionName:"UI/UX",          maxMarks:20, marks:16 },
    { sectionName:"Presentation",   maxMarks:15, marks:12 },
    { sectionName:"Code Quality",   maxMarks:15, marks:13 },
  ], "Excellent commit consistency. Strong full-stack implementation."),
  [T2_ID]: mkRemark(T2_ID, [
    { sectionName:"Innovation",     maxMarks:25, marks:17 },
    { sectionName:"Technical Depth",maxMarks:25, marks:18 },
    { sectionName:"UI/UX",          maxMarks:20, marks:13 },
    { sectionName:"Presentation",   maxMarks:15, marks:10 },
    { sectionName:"Code Quality",   maxMarks:15, marks:10 },
  ], "Two commits detected from outside venue. Post-hackathon commit found."),
  [T3_ID]: mkRemark(T3_ID, [
    { sectionName:"Innovation",     maxMarks:25, marks:20 },
    { sectionName:"Technical Depth",maxMarks:25, marks:20 },
    { sectionName:"UI/UX",          maxMarks:20, marks:15 },
    { sectionName:"Presentation",   maxMarks:15, marks:11 },
    { sectionName:"Code Quality",   maxMarks:15, marks:12 },
  ], "Consistent work rhythm throughout the hackathon. Clean codebase."),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
const TASKS = [
  { _id:"65f00000000000000000f101", team: T1_ID, hackathon: H_ID, title:"Build landing page", completed:true,  createdAt:"2026-02-27T09:00:00.000Z" },
  { _id:"65f00000000000000000f102", team: T1_ID, hackathon: H_ID, title:"Implement backend API", completed:true,  createdAt:"2026-02-27T09:05:00.000Z" },
  { _id:"65f00000000000000000f103", team: T1_ID, hackathon: H_ID, title:"Deploy to production", completed:false, createdAt:"2026-02-27T09:10:00.000Z" },
  { _id:"65f00000000000000000f201", team: T2_ID, hackathon: H_ID, title:"Setup ML pipeline", completed:true,  createdAt:"2026-02-27T09:00:00.000Z" },
  { _id:"65f00000000000000000f202", team: T2_ID, hackathon: H_ID, title:"Build dashboard", completed:false, createdAt:"2026-02-27T09:05:00.000Z" },
  { _id:"65f00000000000000000f301", team: T3_ID, hackathon: H_ID, title:"Train model on dataset", completed:true,  createdAt:"2026-02-27T09:00:00.000Z" },
  { _id:"65f00000000000000000f302", team: T3_ID, hackathon: H_ID, title:"Build REST API", completed:true,  createdAt:"2026-02-27T09:05:00.000Z" },
  { _id:"65f00000000000000000f303", team: T3_ID, hackathon: H_ID, title:"Create visualizations", completed:false, createdAt:"2026-02-27T09:10:00.000Z" },
];

// ── Aggregated judge overviews ────────────────────────────────────────────────
function mkTeamSummary(team, commits, integrity) {
  const validTime  = commits.filter(c => c.timeValid === true).length;
  const invalidTime= commits.filter(c => c.timeValid === false).length;
  const onSite     = commits.filter(c => c.locationStatus === "on-site").length;
  const outside    = commits.filter(c => c.locationStatus === "outside").length;
  return {
    teamId:       team._id,
    teamName:     team.name,
    repo:         team.repoFullName,
    members:      team.members,
    totalCommits: commits.length,
    validTime,
    invalidTime,
    onSite,
    outside,
    flagged:      integrity.verdict !== "PURE",
    integrity,
    commits:      [...commits].sort((a,b) => new Date(b.timestamp)-new Date(a.timestamp)),
  };
}

const JUDGE_OVERVIEW = {
  hackathon: {
    id:        H_ID,
    name:      HACKATHON.name,
    startTime: HACKATHON.startTime,
    endTime:   HACKATHON.endTime,
    venue:     HACKATHON.venue,
  },
  teams: [
    mkTeamSummary(TEAM1, COMMITS_T1, INTEGRITY_T1),
    mkTeamSummary(TEAM2, COMMITS_T2, INTEGRITY_T2),
    mkTeamSummary(TEAM3, COMMITS_T3, INTEGRITY_T3),
  ],
};

// ── Exports ───────────────────────────────────────────────────────────────────
module.exports = {
  H_ID, T1_ID, T2_ID, T3_ID,
  HACKATHON, TEAMS, TEAM1, TEAM2, TEAM3,
  ALL_COMMITS, COMMITS_T1, COMMITS_T2, COMMITS_T3,
  INTEGRITY_T1, INTEGRITY_T2, INTEGRITY_T3,
  SCORING_CRITERIA, REMARKS, TASKS,
  JUDGE_OVERVIEW,
};
