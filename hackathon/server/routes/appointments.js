const express = require("express");
const Appointment = require("../models/AppointmentFirestore");
const { authenticate } = require("../middleware/auth");
const Joi = require("joi");
const router = express.Router();

// Create appointment
const createSchema = Joi.object({
  patientId: Joi.string().required(),
  patientName: Joi.string().required(),
  patientPhone: Joi.string().optional(),
  patientAge: Joi.number().optional(),
  symptoms: Joi.array().items(Joi.string()).optional(),
  specialty: Joi.string().optional(),
  assignedSpecialist: Joi.string().optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'CRITICAL').optional(),
  status: Joi.string().valid('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED').optional(),
  date: Joi.string().required(),
  time: Joi.string().required(),
  duration: Joi.number().optional(),
  type: Joi.string().optional(),
  tokenNumber: Joi.string().optional(),
  queuePosition: Joi.number().optional(),
  routing: Joi.object().optional(),
  notes: Joi.string().optional()
});

router.post("/", async (req, res) => {
  try {
    const payload = {
      ...req.body,
      status: req.body.status || 'SCHEDULED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { error } = createSchema.validate(payload);
    if (error) {
      console.error('Validation error:', error.details);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid input",
        details: error.details 
      });
    }
    
    // Generate token if not provided
    if (!payload.tokenNumber) {
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = date.getHours().toString().padStart(2, '0') + date.getMinutes().toString().padStart(2, '0');
      const randomNum = Math.floor(Math.random() * 999) + 1;
      payload.tokenNumber = `TKN${dateStr}${timeStr}${randomNum.toString().padStart(3, '0')}`;
    }
    
    // Set queue position if not provided
    if (!payload.queuePosition) {
      payload.queuePosition = 1;
    }
    
    const appointment = await Appointment.create(payload);
    console.log('Appointment created:', appointment);
    
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(400).json({ 
      success: false, 
      message: "Failed to create appointment",
      error: error.message 
    });
  }
});

// Get all appointments (optionally filter by doctorId or patientId)
router.get("/", async (req, res) => {
  try {
    const { doctorId, patientId } = req.query;
    let appointments = await Appointment.find();
    
    if (doctorId) appointments = appointments.filter(a => a.doctorId === doctorId);
    if (patientId) appointments = appointments.filter(a => a.patientId === patientId);
    
    appointments.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      if (!a.time || !b.time) return a.date.localeCompare(b.date);
      return a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date);
    });
    
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ success: false, message: "Failed to fetch appointments" });
  }
});

// Get appointment by id
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch appointment" });
  }
});

// Update appointment
router.put("/:id", async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updateData);
    if (!appointment)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to update appointment" });
  }
});

// Cancel appointment
router.post("/:id/cancel", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { 
      status: "CANCELLED",
      updatedAt: new Date().toISOString()
    });
    if (!appointment)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to cancel appointment" });
  }
});

module.exports = router;
