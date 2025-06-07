const mongoose = require('mongoose');

const AdminUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  tel: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AdminUser', AdminUserSchema);
