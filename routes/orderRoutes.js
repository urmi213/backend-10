// routes/orders.js
const express = require('express');
const router = express.Router();
const { createOrder, logRawBody } = require('../controllers/orderController');

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Order API is working!'
  });
});

// Create new order - use the controller
router.post('/', logRawBody, createOrder);

// Get all orders
router.get('/', async (req, res) => {
  try {
    const Order = require('../models/Order');
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get orders by user email
router.get('/user/:email', async (req, res) => {
  try {
    const Order = require('../models/Order');
    const email = req.params.email.toLowerCase();
    const orders = await Order.find({ email }).sort({ createdAt: -1 });
    
    res.json(orders); // Send array directly to match frontend expectation
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;