const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['donor', 'ngo', 'admin'], required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'inactive'], default: 'pending' },
  contact: { type: String, required: true },
  address: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// Create a TTL index that will automatically delete the user 30 days after deletedAt is set
UserSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 }); 

module.exports = mongoose.model('User', UserSchema);
