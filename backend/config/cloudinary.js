const cloudinary = require("cloudinary").v2;
const logger = require("../utils/logger");

const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  logger.info("Cloudinary SDK configured with environment credentials");
} else {
  logger.warn("Cloudinary credentials missing in .env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)");
}

module.exports = { cloudinary, isCloudinaryConfigured };
