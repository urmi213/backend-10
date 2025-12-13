const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// POST create new order
router.post('/', async (req, res) => {
  try {
    console.log('📦 Creating new order:', req.body);
    
    const orderData = req.body;
    
    // Validate required fields
    if (!orderData.email || !orderData.productName) {
      return res.status(400).json({
        success: false,
        message: 'Email and product name are required'
      });
    }
    
    // Create new order
    const order = new Order(orderData);
    await order.save();
    
    console.log(`✅ Order created successfully: ${order._id}`);
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: order
    });
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: error.message
    });
  }
});

// GET orders by user email
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    console.log(`🔍 Fetching orders for: ${email}`);
    
    const orders = await Order.find({ email: email }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
    
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// GET single order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
    
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

module.exports = router;