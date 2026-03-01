// Vercel Serverless Function entry-point.
// All /api/* requests are routed here via vercel.json rewrites.
// The Express app handles routing internally.
const app = require("../backend/server");
module.exports = app;
