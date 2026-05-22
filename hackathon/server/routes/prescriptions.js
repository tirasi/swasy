const express = require('express');
const router = express.Router();
const Prescription = require('../models/PrescriptionFirestore');

router.get('/', async (req, res) => {
  try {
    const { patientId, pharmacyId } = req.query;
    const query = {};
    if (patientId) query.patientId = patientId;
    if (pharmacyId) query.pharmacyId = pharmacyId;
    
    const prescriptions = await Prescription.find(query);
    res.json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const prescription = await Prescription.create(req.body);
    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
