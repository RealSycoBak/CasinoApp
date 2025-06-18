const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  googleId:    { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  email:       { type: String, required: true },
  currency:    { type: Number, default: 1000 },
  wins:    { type: Number, default: 0 },
  sessions:    [{ startedAt: Date, endedAt: Date }],
});

module.exports = mongoose.model('User', UserSchema);