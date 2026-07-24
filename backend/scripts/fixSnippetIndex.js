/**
 * Drop old Snippets text index and sync new index with language_override
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const Snippet = require("../models/Snippet.model");

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    try {
      await Snippet.collection.dropIndexes();
      console.log("✅ Dropped existing indexes on snippets collection.");
    } catch (e) {
      console.log("ℹ️ Index drop info:", e.message);
    }

    await Snippet.syncIndexes();
    console.log("✅ Synced updated indexes on snippets collection.");
  } catch (err) {
    console.error("❌ Index fix error:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

fixIndex();
