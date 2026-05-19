const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  addComplaint,
  getAllComplaints,
  searchComplaintsByLocation,
  updateComplaint,
  deleteComplaint,
} = require("../controllers/complaintController");

const router = express.Router();

router.use(protect);

router.post("/", addComplaint);
router.get("/search", searchComplaintsByLocation);
router.get("/", getAllComplaints);
router.put("/:id", updateComplaint);
router.delete("/:id", deleteComplaint);

module.exports = router;
