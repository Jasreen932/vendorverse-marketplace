require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { MongoMemoryServer } = require('mongodb-memory-server');

const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');
const Report = require('./models/Report');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Environment Validation ──────────────────────────────────────────────────
const REQUIRED_ENV = ['MONGODB_URI'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0 && process.env.NODE_ENV === 'production') {
  console.error(`✗ CRITICAL ERROR: Missing environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

// ─── CORS Configuration ──────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ─── DB Connection & Mocking ──────────────────────────────────────────────────
let isMockMode = false;
const mockData = {
  users: [
    { _id: 'u1', email: 'test@example.com', password: 'password123', name: 'Test User', role: 'Buyer', addresses: [], financial: { availableBalance: 0, pendingPayouts: 0, history: [] }, alerts: [] },
    { _id: 'u2', email: 'seller@example.com', password: 'password123', name: 'Elite Seller', role: 'Seller', storeName: 'Tech Haven', storeBio: 'Best tech deals', addresses: [], financial: { availableBalance: 5240.50, pendingPayouts: 1200.00, history: [] }, alerts: [] },
    { _id: 'u3', email: process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',')[0] : 'admin@example.com', password: process.env.ADMIN_PASSWORD || 'password123', name: 'Site Admin', role: 'Admin', addresses: [], alerts: [] }
  ],
  products: [
    { _id: 'p1', title: 'Acoustic Pro-X Wireless Headphones', vendor: 'TECHGENIC', price: 14999.00, rating: 4.8, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', description: 'Experience studio-quality sound with 40-hour battery life and active noise cancellation.', category: 'Electronics' },
    { _id: 'p2', title: 'Precision Velocity 2.0 Runners', vendor: 'STRIDE', price: 7499.00, rating: 4.9, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80', description: 'Engineered for speed and comfort, these lightweight runners provide ultimate performance.', category: 'Footwear' },
    { _id: 'p3', title: 'Midnight Peak Winter Parka', vendor: 'ALTITUDE', price: 12999.00, rating: 4.7, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=600&q=80', description: 'Stay warm in extreme conditions with our premium insulated winter parka.', category: 'Apparel' },
    { _id: 'p4', title: 'Lumina Smart Home Hub', vendor: 'NEXUS', price: 4500.00, rating: 4.5, image: 'https://images.unsplash.com/photo-1558002038-1055907df8d7?auto=format&fit=crop&w=600&q=80', description: 'Control your entire home with ease using voice commands and smart automation.', category: 'Electronics' },
    { _id: 'p5', title: 'Zenith 4K OLED Television', vendor: 'VISION', price: 89999.00, rating: 4.9, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80', description: 'Stunning 4K OLED display with vibrant colors and deep blacks for the ultimate cinematic experience.', category: 'Electronics' },
    { _id: 'p6', title: 'Urban Legend Leather Backpack', vendor: 'MODERN', price: 5999.00, rating: 4.6, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80', description: 'Crafted from premium full-grain leather, this backpack is both stylish and durable.', category: 'Fashion' },
    { _id: 'p7', title: 'HydraPure Smart Water Bottle', vendor: 'WELLNESS', price: 2499.00, rating: 4.4, image: 'https://images.unsplash.com/photo-1602143399827-bd95967c3c67?auto=format&fit=crop&w=600&q=80', description: 'Keep track of your hydration levels and stay healthy with this smart tracking bottle.', category: 'Smart Home' },
    { _id: 'p8', title: 'Aether Mechanical Keyboard', vendor: 'GAMER', price: 8499.00, rating: 4.8, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=600&q=80', description: 'Ultra-responsive mechanical switches with customizable RGB lighting for elite gaming.', category: 'Computers' },
    { _id: 'p9', title: 'Nordic Oak Minimalist Desk', vendor: 'HAUS', price: 21999.00, rating: 4.7, image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80', description: 'Clean lines and sustainable materials make this desk the perfect centerpiece for your office.', category: 'Office' },
    { _id: 'p10', title: 'Solaris Wireless Charger', vendor: 'TECHGENIC', price: 3299.00, rating: 4.5, image: 'https://images.unsplash.com/photo-1586810165616-94c631fc2f79?auto=format&fit=crop&w=600&q=80', description: 'Fast wireless charging with a sleek, low-profile design that looks great on any desk.', category: 'Electronics' }
  ],
  orders: []
};

const connectDB = async () => {
  try {
    if (process.env.USE_MEMORY_DB === 'true') {
      const mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
      console.log('✓ Connected to In-Memory MongoDB');
    } else {
      console.log('Attempting to connect to MongoDB Atlas...');
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }
      await mongoose.connect(process.env.MONGODB_URI, { 
        serverSelectionTimeoutMS: 10000, // Increased timeout
      });
      console.log('✓ Connected to MongoDB Atlas');

      // Seeding initial data if empty
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        console.log('Seeding initial products...');
        await Product.insertMany(mockData.products.map(p => {
          const { _id, ...rest } = p;
          return rest;
        }));
      }
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('Seeding initial users...');
        await User.insertMany(mockData.users.map(u => {
          const { _id, ...rest } = u;
          return rest;
        }));
      }
      
      // Ensure the specific Admin user from .env exists
      if (process.env.ADMIN_EMAILS) {
        const adminEmail = process.env.ADMIN_EMAILS.split(',')[0].trim();
        const adminPassword = process.env.ADMIN_PASSWORD || '12345678';
        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
          console.log(`Creating default admin: ${adminEmail}`);
          await User.create({
            name: 'Jasreen Kaur',
            email: adminEmail,
            password: adminPassword,
            role: 'Admin'
          });
        } else {
          adminExists.password = adminPassword;
          adminExists.role = 'Admin';
          await adminExists.save();
        }
      }
    }
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err);
    isMockMode = true;
    mongoose.set('bufferCommands', false);
    console.log('Entering Mock Mode for development.');
  }
};

connectDB();

// ─── Data Access Layer ────────────────────────────────────────────────────────
const db = {
  User: {
    findOne: async (query) => isMockMode ? mockData.users.find(u => u.email === query.email) : User.findOne(query),
    save: async (userObj) => {
      if (isMockMode) {
        const idx = mockData.users.findIndex(u => u.email === userObj.email);
        if (idx >= 0) {
          mockData.users[idx] = { ...mockData.users[idx], ...userObj };
          return mockData.users[idx];
        } else {
          const newUser = { ...userObj, _id: Date.now().toString() };
          mockData.users.push(newUser);
          return newUser;
        }
      }
      // Handle plain object vs Mongoose document
      if (!(userObj instanceof mongoose.Model)) {
        const existing = await User.findOne({ email: userObj.email });
        if (existing) {
          Object.assign(existing, userObj);
          return existing.save();
        }
        return new User(userObj).save();
      }
      return userObj.save();
    },
    findById: async (id) => isMockMode ? mockData.users.find(u => u._id === id) : User.findById(id),
    find: async (query = {}) => isMockMode ? mockData.users.filter(u => Object.keys(query).every(k => u[k] === query[k])) : User.find(query)
  },
  Product: {
    find: async (query = {}) => isMockMode ? mockData.products : Product.find(query),
    findById: async (id) => isMockMode ? mockData.products.find(p => p._id === id) : Product.findById(id),
    insertMany: async (items) => isMockMode ? (mockData.products.push(...items), items) : Product.insertMany(items),
    save: async (prodObj) => {
      if (isMockMode) {
        mockData.products.push({ ...prodObj, _id: Date.now().toString() });
        return prodObj;
      }
      return new Product(prodObj).save();
    },
    deleteMany: async () => isMockMode ? (mockData.products = [], []) : Product.deleteMany({})
  },
  Order: {
    find: async (query) => isMockMode ? mockData.orders.filter(o => o.user === query.user) : Order.find(query),
    save: async (orderObj) => isMockMode ? (mockData.orders.push(orderObj), orderObj) : orderObj.save()
  },
  Report: {
    find: async (query = {}) => isMockMode ? [] : Report.find(query).populate('productId'),
    save: async (reportObj) => isMockMode ? reportObj : new Report(reportObj).save(),
    findById: async (id) => isMockMode ? null : Report.findById(id),
    deleteOne: async (id) => isMockMode ? null : Report.findByIdAndDelete(id)
  }
};

// ─── Nodemailer Setup ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.SMTP_PORT || 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

const sendOTPEmail = async (email, otp) => {
  console.log('\n' + '='.repeat(50));
  console.log(`🔑 DEVELOPMENT OTP FOR ${email}: ${otp}`);
  console.log('='.repeat(50) + '\n');
  
  const mailOptions = {
    from: `"VendorVerse Auth" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your OTP Code - VendorVerse',
    html: `<div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;"><h2>Code: ${otp}</h2></div>`
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email sent successfully:', info.messageId);
    return info;
  } catch (err) {
    console.error('✗ Email failed to send:', err.message);
    console.error('Check SMTP settings in .env (User:', process.env.SMTP_USER, ')');
    return { messageId: 'dev-mock-id' };
  }
};

// ─── Routes ───────────────────────────────────────────────────────────────────

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email, type, password, role } = req.body;
    
    // Admin restriction
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    if (role === 'Admin' && !adminEmails.includes(email.toLowerCase())) {
      return res.status(403).json({ error: 'This email is not authorized for Admin access' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    let user = await db.User.findOne({ email });
    if (!user) {
      if (type === 'forgot') return res.status(404).json({ error: 'User not found' });
      user = { 
        email, 
        name: email.split('@')[0], 
        password, 
        otp, 
        otpExpires, 
        role: role || 'Buyer', 
        addresses: [], 
        financial: { availableBalance: 0, pendingPayouts: 0, history: [] }, 
        alerts: [] 
      };
    } else {
      user.otp = otp;
      user.otpExpires = otpExpires;
      if (password) user.password = password;
      if (role) user.role = role;
    }
    await db.User.save(user);
    await sendOTPEmail(email, otp);
    res.json({ message: 'OTP sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp, role, name, password } = req.body;
    const user = await db.User.findOne({ email });
    if (!user || user.otp !== otp || (user.otpExpires && user.otpExpires < new Date())) return res.status(400).json({ error: 'Invalid OTP' });
    
    user.otp = undefined;
    user.otpExpires = undefined;
    if (role) user.role = role;
    if (name) user.name = name;
    if (password) user.password = password;
    await db.User.save(user);
    res.json({ message: 'Success', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Admin restriction check during login
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    if (role === 'Admin' && !adminEmails.includes(email.toLowerCase())) {
      return res.status(403).json({ error: 'This email is not authorized for Admin access' });
    }

    let user = await db.User.findOne({ email });
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid email or password' });
    if (role && user.role !== role) return res.status(401).json({ error: 'Access denied for this role' });
    res.json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { q, category } = req.query;
    let query = {};
    if (q) query.title = { $regex: q, $options: 'i' };
    if (category) query.category = { $regex: category, $options: 'i' };
    const products = await db.Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/featured', async (req, res) => {
  try {
    const products = await db.Product.find();
    res.json(products.slice(0, 4)); // Return first 4 as featured
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await db.Product.save(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/sellers', async (req, res) => {
  try {
    const sellers = await db.User.find({ role: 'Seller' });
    // Add some mock metrics if not present
    const formatted = (sellers || []).slice(0, 3).map(s => ({
      _id: s._id,
      name: s.name || s.storeName || 'Elite Seller',
      avatar: `https://images.unsplash.com/photo-${s._id === 'u2' ? '1507003211169-0a1dd7228f2d' : '1500648767791-00dcc994a43e'}?auto=format&fit=crop&w=80&q=80`,
      tagline: s.storeBio || 'Premium marketplace vendor',
      rating: 4.9,
      orders: 1200
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/profile', async (req, res) => {
  try {
    const { email } = req.query;
    // Populate savedProducts to get full details in frontend
    let user;
    if (isMockMode) {
      user = mockData.users.find(u => u.email === email);
    } else {
      user = await User.findOne({ email }).populate('savedProducts');
    }
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    const orders = await db.Order.find({ user: user._id });
    res.json({ user, orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profile/save-product', async (req, res) => {
  try {
    const { email, productId } = req.body;
    let user = await db.User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (!user.savedProducts) user.savedProducts = [];
    if (!user.savedProducts.includes(productId)) {
      user.savedProducts.push(productId);
      await db.User.save(user);
    }
    
    res.json({ message: 'Product saved successfully', savedProducts: user.savedProducts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/seller/payout/request', (req, res) => {
  res.json({ message: 'Payout request received and is being processed.' });
});

app.post('/api/seller/notifications/read', (req, res) => {
  res.json({ message: 'Notifications marked as read.' });
});

// ─── Razorpay Integration ──────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post('/api/payments/order', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/payments/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ error: "Invalid payment signature" });
    }
  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profile/address', async (req, res) => {
  try {
    const { email, address } = req.body;
    const user = await db.User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.addresses) user.addresses = [];
    user.addresses.push(address);
    await db.User.save(user);
    res.json(user.addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/seller/profile', async (req, res) => {
  try {
    const { email, storeName, storeBio, storeUrl, social, businessInfo } = req.body;
    let user = await db.User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (storeName !== undefined) user.storeName = storeName;
    if (storeBio !== undefined) user.storeBio = storeBio;
    if (storeUrl !== undefined) user.storeUrl = storeUrl;
    if (social !== undefined) user.social = social;
    if (businessInfo !== undefined) user.businessInfo = businessInfo;
    await db.User.save(user);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Admin Management Endpoints ──────────────────────────────────────────────

app.get('/api/admin/stats', async (req, res) => {
  try {
    const users = await db.User.find();
    const products = await db.Product.find();
    const sellers = users.filter(u => u.role === 'Seller');
    const buyers = users.filter(u => u.role === 'Buyer');
    
    res.json({
      totalRevenue: 12584000, // Mock in INR
      activeVendors: sellers.length,
      newUsers: users.length,
      pendingModeration: 24, // Mock for now
      usersBreakdown: {
        buyers: buyers.length,
        sellers: sellers.length,
        admins: users.filter(u => u.role === 'Admin').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await db.User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await db.User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.status = status; // Assuming status field exists or will be handled
    await db.User.save(user);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/vendors', async (req, res) => {
  try {
    const sellers = await db.User.find({ role: 'Seller' });
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/vendors/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const seller = await db.User.findById(id);
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    seller.vendorStatus = status; // 'Approved', 'Rejected', 'Pending'
    await db.User.save(seller);
    res.json(seller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/products/flagged', async (req, res) => {
  try {
    // In a real app, we'd query for products with flags
    const products = await db.Product.find();
    const flagged = products.slice(0, 4).map(p => ({
      ...p.toObject ? p.toObject() : p,
      flagReason: 'Suspicious Price',
      priority: 'High'
    }));
    res.json(flagged);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMockMode) {
      mockData.products = mockData.products.filter(p => p._id !== id);
    } else {
      await Product.findByIdAndDelete(id);
      // Also delete reports associated with this product
      await Report.deleteMany({ productId: id });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    const { userEmail, reason, details } = req.body;
    const user = await db.User.findOne({ email: userEmail });
    
    const report = {
      productId: id,
      userId: user ? user._id : null,
      userEmail,
      reason,
      details,
      status: 'Pending'
    };
    
    await db.Report.save(report);
    res.json({ message: 'Report submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/reports', async (req, res) => {
  try {
    const reports = await db.Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/reports/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (isMockMode) return res.json({ message: 'Mock update' });
    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    report.status = status;
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chat', (req, res) => {
  const msg = req.body.message.toLowerCase();
  let reply = "I can help with shipping, returns, or account issues.";
  if (msg.includes('ship')) reply = "Standard: 3-5 days. Express: 1-2 days.";
  else if (msg.includes('return')) reply = "30-day return policy. Visit your profile.";
  else if (msg.includes('hello') || msg.includes('hi')) reply = "Welcome to VendorVerse! How can I help?";
  setTimeout(() => res.json({ reply }), 600);
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('✗ Server Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

app.get('/', (req, res) => res.send('VendorVerse API is running ✓'));
app.listen(PORT, () => console.log(`✓ VendorVerse server running on port ${PORT}`));
