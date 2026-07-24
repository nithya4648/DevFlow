/**
 * Test Email Sending & Verification Link Generation
 *
 * Usage: node scripts/testEmailRegistration.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { sendVerificationEmail, sendPasswordResetEmail } = require("../utils/email.utils");

async function testEmail() {
  console.log("==========================================");
  console.log("🧪 Testing Email Utility Configuration...");
  console.log(`   EMAIL_USER : ${process.env.EMAIL_USER || "(not set)"}`);
  console.log(`   CLIENT_URL : ${process.env.CLIENT_URL || "(not set)"}`);
  console.log("==========================================");

  const testEmailAddress = process.env.EMAIL_USER || "testuser@example.com";
  const dummyToken = "abc123def456token789";

  try {
    console.log("\n1. Testing sendVerificationEmail...");
    await sendVerificationEmail(testEmailAddress, dummyToken);
    console.log("✅ sendVerificationEmail completed without throwing.");
  } catch (err) {
    console.error("❌ sendVerificationEmail failed:", err.message);
  }

  try {
    console.log("\n2. Testing sendPasswordResetEmail...");
    await sendPasswordResetEmail(testEmailAddress, dummyToken);
    console.log("✅ sendPasswordResetEmail completed without throwing.");
  } catch (err) {
    console.error("❌ sendPasswordResetEmail failed:", err.message);
  }

  console.log("\n==========================================");
  console.log("🏁 Email Utility Test Complete.");
  console.log("==========================================");
}

testEmail();
