const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Buyer', 'Seller', 'Admin'], default: 'Buyer' },
  phone: { type: String, default: '' },
  addresses: [{
    type: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
    name: String,
    street: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
    isDefault: { type: Boolean, default: false }
  }],
  savedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  notificationsEnabled: { type: Boolean, default: true },
  
  // Seller Alerts
  alerts: [{
    type: { type: String, enum: ['Order', 'System', 'Security'], default: 'System' },
    title: String,
    message: String,
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  
  // Seller Financials
  financial: {
    availableBalance: { type: Number, default: 0 },
    pendingPayouts: { type: Number, default: 0 },
    methods: [{
      bankName: String,
      accountMask: String,
      isPrimary: { type: Boolean, default: false }
    }],
    history: [{
      payoutId: String,
      amount: Number,
      status: { type: String, enum: ['Paid', 'Processing', 'Failed'], default: 'Processing' },
      date: { type: Date, default: Date.now }
    }]
  },
  
  // Seller fields
  storeName: { type: String, default: '' },
  storeBio: { type: String, default: '' },
  storeUrl: { type: String, default: '' },
  social: {
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' }
  },
  businessInfo: {
    legalName: { type: String, default: '' },
    taxId: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  
  // Auth
  otp: { type: String },
  otpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
