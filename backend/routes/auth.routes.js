const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();


router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, contact, location, address } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name, email, password: hashedPassword, role, contact, location, address
    });

    await user.save();

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });

    res.status(201).json({ token, user: { id: user.id, name, email, role, contact, status: user.status, location: user.location, address: user.address } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const payload = { userId: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, contact: user.contact, status: user.status, location: user.location, address: user.address } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Profile (restricted to contact, address, location)
router.put('/profile/:id', async (req, res) => {
  try {
    const { contact, address, location } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.contact = contact !== undefined ? contact : user.contact;
    user.address = address !== undefined ? address : user.address;
    user.location = location !== undefined ? location : user.location;

    await user.save();
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, contact: user.contact, address: user.address, location: user.location });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Change Password
router.put('/change-password/:id', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect old password' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Deactivate / Delete Account (Soft Delete)
router.put('/deactivate-account/:id', async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });
    }

    user.status = 'inactive';
    user.deletedAt = new Date();
    await user.save();

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot Password (Student logic: Match Email + Contact, then allow reset)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, contact, newPassword } = req.body;
    const user = await User.findOne({ email, contact });
    if (!user) return res.status(404).json({ error: 'User not found or details mismatch' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Active Approved NGOs
router.get('/ngos', async (req, res) => {
  try {
    const ngos = await User.find({ role: 'ngo', status: 'approved' }).select('-password');
    res.json(ngos);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
