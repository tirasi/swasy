const express = require("express");
const Doctor = require("../models/DoctorFirestore");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

// List doctors - protected
router.get("/", authenticate, async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch doctors" });
  }
});

// Get doctor by id - protected
router.get("/:id", authenticate, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch doctor" });
  }
});

module.exports = router;
