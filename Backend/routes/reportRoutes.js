const express = require('express');
const router = express.Router();
const reportModel = require('../models/reportModel');

// Example route to fetch reports
router.get('/reports', async (req, res) => {
    try {
        const reports = await reportModel.find({ userId: req.user._id });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

module.exports = router;
