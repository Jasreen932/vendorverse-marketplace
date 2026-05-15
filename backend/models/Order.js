const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Order Placed', 'Processing', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'], default: 'Order Placed' },
  trackingNumber: { type: String, default: () => 'TRK' + Math.floor(Math.random() * 100000000) },
  step: { type: Number, default: 0 },
  shippingAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zip: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
