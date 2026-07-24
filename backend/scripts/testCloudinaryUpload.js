/**
 * Test Cloudinary SDK Configuration & Upload Helper
 *
 * Usage: node scripts/testCloudinaryUpload.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

async function testCloudinary() {
  console.log("==========================================");
  console.log("🧪 Testing Cloudinary Configuration...");
  console.log(`   CLOUDINARY_CLOUD_NAME : ${process.env.CLOUDINARY_CLOUD_NAME || "(not set)"}`);
  console.log(`   CLOUDINARY_API_KEY    : ${process.env.CLOUDINARY_API_KEY ? "******" + process.env.CLOUDINARY_API_KEY.slice(-4) : "(not set)"}`);
  console.log(`   Is Configured?        : ${isCloudinaryConfigured()}`);
  console.log("==========================================");

  if (!isCloudinaryConfigured()) {
    console.log("ℹ️ Cloudinary credentials not set in .env. The system will seamlessly fall back to Data URI encoding for avatars when images are uploaded.");
    return;
  }

  try {
    console.log("☁️ Attempting test upload to Cloudinary...");
    // 1x1 transparent PNG buffer
    const dummyBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64"
    );

    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "devflow_avatars_test", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(dummyBuffer);
    });

    const result = await uploadPromise;
    console.log("✅ Cloudinary Test Upload Successful!");
    console.log(`   Public ID  : ${result.public_id}`);
    console.log(`   Secure URL : ${result.secure_url}`);
  } catch (err) {
    console.error("❌ Cloudinary Test Upload Failed:", err.message || err);
  }
}

testCloudinary();
