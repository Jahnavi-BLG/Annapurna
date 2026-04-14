const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const authRoutes = require('./routes/auth.routes');
const donationRoutes = require('./routes/donation.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
  }
});

app.set('io', io); // make io accessible in routes

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', donationRoutes);
app.use('/api/admin', adminRoutes);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/annapurna';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Admin Seeding
    try {
      const adminExists = await User.findOne({ email: 'admin@annapurna.com' });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin@123', salt);
        await User.create({
          name: 'Super Admin',
          email: 'admin@annapurna.com',
          password: hashedPassword,
          role: 'admin',
          status: 'approved',
          contact: 'System Default'
        });
        console.log('Default Admin Account Seeded (admin@annapurna.com / admin@123)');
      }
    } catch (err) {
      console.error('Error seeding admin:', err);
    }

    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB connection error:', err));
