const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

const mockProducts = [
  {
    title: "Sony WH-1000XM5 Wireless Headphones",
    price: 398.00,
    vendor: "Sony Official",
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800",
    description: "Industry leading noise canceling with two processors and eight microphones.",
    rating: 4.8,
    reviews: 1245
  },
  {
    title: "Apple MacBook Pro 14\"",
    price: 1999.00,
    vendor: "Apple Store",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
    description: "M3 Pro chip with 11-core CPU, 14-core GPU.",
    rating: 4.9,
    reviews: 892
  },
  {
    title: "Keychron K2 Wireless Mechanical Keyboard",
    price: 79.99,
    vendor: "Keychron",
    image: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=800",
    description: "A versatile wireless mechanical keyboard with compact 84 key layout.",
    rating: 4.6,
    reviews: 430
  },
  {
    title: "Logitech MX Master 3S",
    price: 99.99,
    vendor: "Logitech",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c3c9c?auto=format&fit=crop&q=80&w=800",
    description: "Advanced wireless mouse with MagSpeed scrolling.",
    rating: 4.7,
    reviews: 2100
  }
];

// Get all products
router.get('/', async (req, res) => {
  try {
    let products = await Product.find({});
    // Auto seed for demo purposes if empty
    if (products.length === 0) {
      products = await Product.insertMany(mockProducts);
    }
    
    // Apply search filter if query provided
    const query = req.query.q;
    if (query) {
      products = products.filter(p => p.title.toLowerCase().includes(query.toLowerCase()) || p.vendor.toLowerCase().includes(query.toLowerCase()));
    }
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
