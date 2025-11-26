const { Schema, model } = require('mongoose');
const { ROLES } = require('../utils/constants');

const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: Object.values(ROLES), required: true },
  passwordHash: { type: String, required: true },
  mustChangePassword: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = model('User', userSchema);
