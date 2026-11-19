const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/i, 'Only @gmail.com email addresses are allowed'],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    preferences: {
      defaultBudget: Number,
      interests: [String],
      preferredHotelType: String,
      dataConsent: { type: Boolean, default: true },
      reducedMotion: { type: Boolean, default: false },
      largeText: { type: Boolean, default: false },
    },
    favorites: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
