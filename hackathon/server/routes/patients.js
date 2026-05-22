const express = require("express");
const Patient = require("../models/PatientFirestore");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

// Input validation
const sanitizeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Get all patients - protected
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json({ success: true, data: patients });
  } catch (error) {
    console.error("Get patients error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch patients" });
  }
});

// Get patient by ID - protected
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    console.error("Get patient error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch patient" });
  }
});

// Create new patient - protected
router.post("/", async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    console.error("Create patient error:", error.message);
    res.status(400).json({ success: false, message: "Failed to create patient" });
  }
});

// Update patient - protected
router.put("/:id", async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body);

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to update patient" });
  }
});

// Assign doctor to patient and open a case - protected
router.post("/:id/assign-doctor", authenticate, async (req, res) => {
  try {
    const { doctorId, caseDetails } = req.body;
    
    const patient = await Patient.findById(req.params.id);
    if (!patient)
      return res.status(404).json({ success: false, message: "Patient not found" });

    const updated = await Patient.findByIdAndUpdate(req.params.id, {
      assignedDoctor: doctorId,
      case: {
        status: "OPEN",
        details: caseDetails || "",
        createdAt: new Date(),
      }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to assign doctor" });
  }
});

// Approve case - protected
router.post("/:id/case/approve", authenticate, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient || !patient.case)
      return res.status(404).json({ success: false, message: "Case not found" });
    
    const updated = await Patient.findByIdAndUpdate(req.params.id, {
      case: {
        ...patient.case,
        status: "APPROVED",
        approvedAt: new Date()
      }
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to approve case" });
  }
});

// Close case and move to history - protected
router.post("/:id/case/close", authenticate, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient || !patient.case)
      return res.status(404).json({ success: false, message: "Case not found" });
    
    const closed = {
      status: "CLOSED",
      details: patient.case.details,
      createdAt: patient.case.createdAt,
      closedAt: new Date(),
    };
    const caseHistory = patient.caseHistory || [];
    caseHistory.push(closed);
    
    const updated = await Patient.findByIdAndUpdate(req.params.id, {
      case: null,
      caseHistory
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to close case" });
  }
});

// Search patients - protected
router.get("/search/:query", authenticate, async (req, res) => {
  try {
    const query = sanitizeRegex(req.params.query);
    const patients = await Patient.find();
    
    const filtered = patients.filter(p => 
      p.name?.toLowerCase().includes(query.toLowerCase()) ||
      p.email?.toLowerCase().includes(query.toLowerCase()) ||
      p.phone?.includes(query) ||
      p.symptoms?.some(s => s.toLowerCase().includes(query.toLowerCase()))
    );

    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: "Search failed" });
  }
});

module.exports = router;
