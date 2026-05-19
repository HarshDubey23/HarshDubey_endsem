const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  analyzeAllComplaints,
  analyzeSingleComplaint,
} = require("../controllers/aiController");

const router = express.Router();

router.use(protect);

router.post("/analyze", analyzeAllComplaints);
router.post("/analyze/:id", analyzeSingleComplaint);

module.exports = router;
