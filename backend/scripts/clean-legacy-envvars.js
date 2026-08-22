// backend/scripts/clean-legacy-envvars.js — run once: node scripts/clean-legacy-envvars.js
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const EnvVariable = require("../models/EnvVariable.model");
  const all = await EnvVariable.find({});
  let removed = 0;
  for (const v of all) {
    try {
      v.toJSON(); // triggers the decrypt getter — throws if old/incompatible format
    } catch (e) {
      await EnvVariable.deleteOne({ _id: v._id });
      removed++;
    }
  }
  console.log(`Checked ${all.length}, removed ${removed} undecryptable legacy records, kept the rest.`);
  process.exit(0);
});
