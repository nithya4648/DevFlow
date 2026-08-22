// backend/scripts/clear-stale-teamids.js — run once: node scripts/clear-stale-teamids.js
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Doc = require("../models/Doc.model");
  const Project = require("../models/Project.model");
  const Snippet = require("../models/Snippet.model");
  for (const M of [Doc, Project, Snippet]) {
    const r = await M.updateMany({ teamId: { $ne: null } }, { $set: { teamId: null } });
    console.log(M.modelName, "->", r.modifiedCount, "records unlocked");
  }
  process.exit(0);
});
