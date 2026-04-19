const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // e.g. 'new_donation', 'donation_claimed', 'donation_picked_up'
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String } // optional link to a specific item
}, { timestamps: true });

// Auto delete after 7 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('Notification', NotificationSchema);
