const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  reason: { type: String, required: true },
  details: { type: String },
  status: { type: String, enum: ['Pending', 'Resolved', 'Dismissed'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
