/**
 * DevFlow Comprehensive Integration Test Suite
 *
 * Usage: node scripts/runFullIntegrationTest.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
const User = require("../models/User.model");

const BASE_URL = "http://localhost:5001";

let testResults = [];

function recordResult(stepName, passed, details = "") {
  testResults.push({ stepName, passed, details });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} [${passed ? "PASS" : "FAIL"}] ${stepName}${details ? " - " + details : ""}`);
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("🚀 STARTING DEVFLOW COMPREHENSIVE INTEGRATION SUITE");
  console.log("=======================================================\n");

  await mongoose.connect(process.env.MONGO_URI);

  const timestamp = Date.now();
  const testEmail = `integration_${timestamp}@example.com`;
  const initialPassword = "Password@123";
  const newPassword = "NewPassword@456";
  let authToken = "";
  let userId = "";

  try {
    // -----------------------------------------------------------------
    // 1. REGISTER NEW USER & EMAIL VERIFICATION FLOW
    // -----------------------------------------------------------------
    console.log("--- Step 1: Register New User & Real Email Verification Flow ---");
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Real Verification User ${timestamp}`,
        email: testEmail,
        password: initialPassword,
      }),
    });

    const regData = await regRes.json();
    if (regRes.status === 201 && regData.success) {
      recordResult("1a. User Registration", true, `Message: ${regData.message}`);
    } else {
      recordResult("1a. User Registration", false, `Status: ${regRes.status}, Error: ${regData.message}`);
    }

    // Verify User record in DB has isVerified: false and verificationToken set
    let dbUser = await User.findOne({ email: testEmail });
    if (dbUser && dbUser.isVerified === false && dbUser.verificationToken) {
      recordResult("1b. Database Record (Unverified + Token)", true, `ID: ${dbUser._id}, Token Length: ${dbUser.verificationToken.length}`);
      userId = dbUser._id.toString();
    } else {
      recordResult("1b. Database Record (Unverified + Token)", false, `User verified state: ${dbUser?.isVerified}`);
    }

    // -----------------------------------------------------------------
    // 2. PRE-VERIFICATION LOGIN BLOCKED, VERIFICATION LINK, POST-VERIFICATION LOGIN
    // -----------------------------------------------------------------
    console.log("\n--- Step 2: Verification Enforcement & Login ---");
    // Pre-verification login attempt MUST fail with 403
    const blockedLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: initialPassword }),
    });
    const blockedLoginData = await blockedLoginRes.json();
    if (blockedLoginRes.status === 403 && blockedLoginData.isVerified === false) {
      recordResult("2a. Pre-verification Login Blocked (403)", true, blockedLoginData.message);
    } else {
      recordResult("2a. Pre-verification Login Blocked (403)", false, `Status: ${blockedLoginRes.status}`);
    }

    // Execute Email Verification via Token
    const verifyLinkRes = await fetch(`${BASE_URL}/api/auth/verify-email/${dbUser.verificationToken}`);
    const verifyLinkData = await verifyLinkRes.json();
    if (verifyLinkRes.status === 200 && verifyLinkData.success) {
      recordResult("2b. Email Verification Token Click", true, verifyLinkData.message);
    } else {
      recordResult("2b. Email Verification Token Click", false, `Status: ${verifyLinkRes.status}, Message: ${verifyLinkData.message}`);
    }

    // Post-verification login attempt MUST succeed with 200
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail, password: initialPassword }),
    });

    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.token) {
      authToken = loginData.token;
      recordResult("2c. Post-verification User Login", true, `Token received successfully`);
    } else {
      recordResult("2c. Post-verification User Login", false, `Status: ${loginRes.status}, Message: ${loginData.message}`);
    }

    // Test /me endpoint with token
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const meData = await meRes.json();
    if (meRes.status === 200 && meData.user?.email === testEmail) {
      recordResult("2d. Protected /me Endpoint", true, `Email: ${meData.user.email}`);
    } else {
      recordResult("2d. Protected /me Endpoint", false, `Status: ${meRes.status}`);
    }

    // Test logout
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const logoutData = await logoutRes.json();
    if (logoutRes.status === 200 && logoutData.success) {
      recordResult("2e. Logout", true, logoutData.message);
    } else {
      recordResult("2e. Logout", false, `Status: ${logoutRes.status}`);
    }

    // -----------------------------------------------------------------
    // 3. GOOGLE OAUTH LOGIN ROUTE
    // -----------------------------------------------------------------
    console.log("\n--- Step 3: Google OAuth Route ---");
    const googleRes = await fetch(`${BASE_URL}/api/auth/google`, { redirect: "manual" });
    const location = googleRes.headers.get("location");
    if (googleRes.status === 302 && location && location.includes("accounts.google.com")) {
      recordResult("3. Google OAuth Route", true, `Redirects to Google OAuth: ${location.slice(0, 45)}...`);
    } else {
      recordResult("3. Google OAuth Route", false, `Status: ${googleRes.status}, Location: ${location}`);
    }

    // -----------------------------------------------------------------
    // 4. FORGOT & RESET PASSWORD
    // -----------------------------------------------------------------
    console.log("\n--- Step 4: Forgot & Reset Password ---");
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const forgotData = await forgotRes.json();
    recordResult("4a. Request Forgot Password", forgotRes.status === 200, forgotData.message);

    // Fetch reset token from DB
    const userForReset = await User.findOne({ email: testEmail });
    const resetToken = userForReset.resetPasswordToken;

    if (resetToken) {
      recordResult("4b. Reset Token Generation", true, `Token found in DB`);

      const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password/${resetToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const resetData = await resetRes.json();
      recordResult("4c. Reset Password Execution", resetRes.status === 200, resetData.message);

      // Verify login with new password
      const newLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, password: newPassword }),
      });
      const newLoginData = await newLoginRes.json();
      if (newLoginRes.status === 200 && newLoginData.token) {
        authToken = newLoginData.token; // update token for remaining tests
        recordResult("4d. Login with New Password", true, "Successfully logged in with new password");
      } else {
        recordResult("4d. Login with New Password", false, newLoginData.message);
      }
    } else {
      recordResult("4b. Reset Token Generation", false, "Reset token not saved in DB");
    }

    // -----------------------------------------------------------------
    // 5. UPLOAD AN AVATAR
    // -----------------------------------------------------------------
    console.log("\n--- Step 5: Upload Avatar ---");
    const dummyImageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64"
    );

    const formData = new FormData();
    formData.append("name", `Integration User Updated`);
    formData.append("avatar", new Blob([dummyImageBuffer], { type: "image/png" }), "avatar.png");

    const avatarRes = await fetch(`${BASE_URL}/api/users/profile`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${authToken}` },
      body: formData,
    });
    const avatarData = await avatarRes.json();
    if (avatarRes.status === 200 && avatarData.user?.avatar) {
      recordResult("5. Avatar Upload", true, `Avatar URL/URI length: ${avatarData.user.avatar.length}`);
    } else {
      recordResult("5. Avatar Upload", false, `Status: ${avatarRes.status}, Message: ${avatarData.message || JSON.stringify(avatarData)}`);
    }

    // -----------------------------------------------------------------
    // 6. CREATE ITEM IN EACH MODULE
    // -----------------------------------------------------------------
    console.log("\n--- Step 6: Create One Item in Each Module ---");

    // 6a. Project
    const projRes = await fetch(`${BASE_URL}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ title: "Integration Project", description: "Testing project creation", status: "todo" }),
    });
    const projData = await projRes.json();
    recordResult("6a. Create Project", projRes.status === 201, projRes.status === 201 ? `ID: ${projData.data?._id}` : `Status: ${projRes.status}, Error: ${JSON.stringify(projData)}`);

    // 6b. Snippet
    const snipRes = await fetch(`${BASE_URL}/api/snippets`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ title: "Integration Snippet", code: "console.log('test');", language: "javascript" }),
    });
    const snipData = await snipRes.json();
    recordResult("6b. Create Snippet", snipRes.status === 201, snipRes.status === 201 ? `ID: ${snipData.data?._id}` : `Status: ${snipRes.status}, Error: ${JSON.stringify(snipData)}`);

    // 6c. Doc
    const docRes = await fetch(`${BASE_URL}/api/docs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ title: "Integration Doc", content: "# API Docs\nThis is a test document." }),
    });
    const docData = await docRes.json();
    recordResult("6c. Create Doc", docRes.status === 201, `ID: ${docData.data?._id || "N/A"}`);

    // 6d. Note
    const noteRes = await fetch(`${BASE_URL}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ title: "Integration Note", content: "Test note content" }),
    });
    const noteData = await noteRes.json();
    recordResult("6d. Create Note", noteRes.status === 201, `ID: ${noteData.data?._id || "N/A"}`);

    // 6e. Bookmark
    const bmRes = await fetch(`${BASE_URL}/api/bookmarks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ title: "Integration Bookmark", url: "https://devflow.com" }),
    });
    const bmData = await bmRes.json();
    recordResult("6e. Create Bookmark", bmRes.status === 201, `ID: ${bmData.data?._id || "N/A"}`);

    // 6f. Env Variable
    const envRes = await fetch(`${BASE_URL}/api/env-vars`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ key: "INTEGRATION_KEY", value: "secret123", environment: "development" }),
    });
    const envData = await envRes.json();
    recordResult("6f. Create Env Var", envRes.status === 201, `ID: ${envData.data?._id || "N/A"}`);

    // -----------------------------------------------------------------
    // 7. CONFIRM PROTECTED ROUTES RETURN 401 WITHOUT TOKEN
    // -----------------------------------------------------------------
    console.log("\n--- Step 7: Protected Routes Return 401 Without Token ---");
    const protectedEndpoints = [
      "/api/projects",
      "/api/snippets",
      "/api/docs",
      "/api/notes",
      "/api/bookmarks",
      "/api/env-vars",
      "/api/users/sessions",
    ];

    let allReturned401 = true;
    for (const ep of protectedEndpoints) {
      const res = await fetch(`${BASE_URL}${ep}`);
      if (res.status !== 401) {
        allReturned401 = false;
        recordResult(`7. Unauthorized check ${ep}`, false, `Status was ${res.status} (expected 401)`);
      }
    }
    if (allReturned401) {
      recordResult("7. Protected Routes Return 401 Without Token", true, "All 7 protected endpoints returned 401 Unauthorized");
    }

  } catch (error) {
    console.error("❌ Test suite runtime exception:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n=======================================================");
    console.log("📊 FINAL INTEGRATION TEST RESULTS SUMMARY");
    console.log("=======================================================");
    const passedCount = testResults.filter((r) => r.passed).length;
    console.log(`TOTAL: ${testResults.length} | PASSED: ${passedCount} | FAILED: ${testResults.length - passedCount}\n`);
  }
}

runTests();
