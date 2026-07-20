// backend/routes/doc.routes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  getDocs,
  createDoc,
  getDocById,
  updateDoc,
  deleteDoc,
  getDocVersions,
  getDocVersionById,
} = require("../controllers/doc.controller");

router.use(protect);

router.route("/").get(getDocs).post(createDoc);
router.route("/:id").get(getDocById).put(updateDoc).delete(deleteDoc);
router.route("/:id/versions").get(getDocVersions);
router.route("/:id/versions/:versionId").get(getDocVersionById);

module.exports = router;
