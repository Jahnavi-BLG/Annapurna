const express = require('express');
const User = require('../models/User');
const Donation = require('../models/Donation');

const router = express.Router();

// Get all users (NGOs and Donors)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all donations
router.get('/donations', async (req, res) => {
  try {
    const donations = await Donation.find().populate('donorId', 'name contact');
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
