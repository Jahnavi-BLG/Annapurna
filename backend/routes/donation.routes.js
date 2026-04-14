const express = require('express');
const Donation = require('../models/Donation');
const router = express.Router();

// Middleware to inject io if possible or we can pass io to router
// For simplicity, we'll pass io via req.app.get('io') in controller methods.

router.post('/donateFood', async (req, res) => {
  try {
    const { foodType, quantity, preparationTime, expiryTime, pickupWindow, location, donorId } = req.body;
    
    const donation = new Donation({
      foodType, quantity, preparationTime, expiryTime, pickupWindow, location, donorId
    });

    await donation.save();

    // Populate donor details for notification
    await donation.populate('donorId', 'name contact');

    // Emit real-time event to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('new_donation', donation);
    }

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

router.get('/donations', async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const donations = await Donation.find({ status }).populate('donorId', 'name contact').sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/claimFood', async (req, res) => {
  try {
    const { donationId, ngoId } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });
    if (donation.status !== 'pending') return res.status(400).json({ error: 'Donation is no longer available' });

    donation.status = 'claimed';
    donation.claimedBy = ngoId;
    donation.claimedAt = new Date();

    await donation.save();
    await donation.populate('claimedBy', 'name contact');

    // Notify the donor
    const io = req.app.get('io');
    if (io) {
      io.emit('donation_updated', donation);
    }

    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/updateStatus', async (req, res) => {
  try {
    const { donationId, status } = req.body;
    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ error: 'Donation not found' });

    donation.status = status;
    if (status === 'delivered') {
      donation.deliveredAt = new Date();
    }
    await donation.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('donation_updated', donation);
    }

    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const donations = await Donation.find({
      $or: [{ donorId: userId }, { claimedBy: userId }]
    }).populate('donorId', 'name').populate('claimedBy', 'name').sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
