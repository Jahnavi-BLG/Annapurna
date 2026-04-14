const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  foodType: { type: String, required: true },
  quantity: { type: Number, required: true }, // number of people it can serve
  preparationTime: { type: Date },
  expiryTime: { type: Date, required: true },
  pickupWindow: { type: String }, // e.g., "7:00 PM - 9:00 PM"
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'claimed', 'picked_up', 'delivered'], default: 'pending' },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  claimedAt: { type: Date },
  deliveredAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Donation', DonationSchema);
