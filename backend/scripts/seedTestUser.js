/**
 * Seed Script: Create / reset the test@example.com demo account
 *
 * Usage:  node scripts/seedTestUser.js
 *
 * This script upserts a verified test user so you can log in immediately
 * without going through email verification.
 *
 * Credentials after running:
 *   Email    : test@example.com
 *   Password : Test@1234
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

// Override DNS to match server.js — required for MongoDB Atlas SRV resolution
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User.model");

const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "Test@1234";
const TEST_NAME = "Test User";

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // ── 1. Upsert test@example.com ───────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

    const user = await User.findOneAndUpdate(
      { email: TEST_EMAIL },
      {
        $set: {
          name: TEST_NAME,
          email: TEST_EMAIL,
          password: hashedPassword,
          isVerified: true,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(TEST_NAME)}&background=6366f1&color=fff&size=128`,
          verificationToken: undefined,
          verificationTokenExpiry: undefined,
          resetPasswordToken: undefined,
          resetPasswordTokenExpiry: undefined,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("\n🧪 Test account ready:");
    console.log(`   Email    : ${TEST_EMAIL}`);
    console.log(`   Password : ${TEST_PASSWORD}`);
    console.log(`   Verified : ${user.isVerified}`);
    console.log(`   ID       : ${user._id}`);

    // ── 2. Bulk-verify ALL existing unverified users ─────────────────────────
    // (Fixes accounts registered before the auto-verify dev-mode fix was added)
    const result = await User.updateMany(
      { isVerified: false },
      {
        $set: {
          isVerified: true,
          verificationToken: undefined,
          verificationTokenExpiry: undefined,
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`\n🔓 Bulk-verified ${result.modifiedCount} previously unverified user(s).`);
    } else {
      console.log("\n✅ No unverified users found — nothing to bulk-verify.");
    }

    console.log("\n✅ Done! All users are now verified and can log in.\n");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
