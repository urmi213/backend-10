const Order = require('../models/Order');

// Middleware to log raw requests (add this before body-parser in server.js)
const logRawBody = (req, res, next) => {
  if (req.originalUrl === '/api/orders' && req.method === 'POST') {
    let rawBody = '';
    req.on('data', chunk => {
      rawBody += chunk.toString();
    });
    req.on('end', () => {
      console.log('🔍 RAW REQUEST BODY (before parsing):');
      console.log(rawBody);
      console.log('🔍 RAW BODY LENGTH:', rawBody.length);
      try {
        const parsed = JSON.parse(rawBody);
        console.log('🔍 Parsed JSON:', parsed);
        console.log('🔍 Has price field?', 'price' in parsed);
        console.log('🔍 Price value in raw body:', parsed.price);
      } catch (e) {
        console.log('🔍 Not valid JSON or empty');
      }
    });
  }
  next();
};

const createOrder = async (req, res) => {
  try {
    console.log('🚨 ========== REQUEST START ==========');
    console.log('📝 POST /api/orders');
    console.log('📝 Headers:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });
    
    // Debug the actual received body
    console.log('📝 Received req.body:', req.body);
    console.log('📝 Type of req.body:', typeof req.body);
    
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('❌ EMPTY REQUEST BODY');
      return res.status(400).json({
        success: false,
        message: 'Empty request body received'
      });
    }
    
    console.log('📝 All fields in req.body:', Object.keys(req.body));
    console.log('📝 Field values:');
    Object.entries(req.body).forEach(([key, value]) => {
      console.log(`   ${key}: ${value} (type: ${typeof value})`);
    });
    
    // SPECIAL DEBUG FOR PRICE
    console.log('💰 PRICE FIELD INVESTIGATION:');
    console.log('   - Direct access (req.body.price):', req.body.price);
    console.log('   - Using bracket notation (req.body["price"]):', req.body["price"]);
    console.log('   - Has own property "price"?', req.body.hasOwnProperty('price'));
    console.log('   - "price" in req.body?', 'price' in req.body);
    
    // Check for case variations
    const priceVariations = ['price', 'Price', 'PRICE', 'cost', 'Cost', 'amount', 'Amount'];
    let foundPrice = null;
    let foundKey = null;
    
    for (const key of priceVariations) {
      if (req.body[key] !== undefined) {
        foundPrice = req.body[key];
        foundKey = key;
        console.log(`✅ Found price as "${key}": ${foundPrice}`);
        break;
      }
    }
    
    console.log('🚨 ========== REQUEST END ==========');
    
    // Check for required fields - but don't fail if price is missing
    const requiredFields = ['productId', 'buyerName', 'email'];
    const missingFields = requiredFields.filter(field => 
      !req.body[field] && req.body[field] !== 0
    );
    
    if (missingFields.length > 0) {
      console.log(`❌ Missing required fields: ${missingFields.join(', ')}`);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        receivedData: req.body
      });
    }
    
    // Process the data with flexible price handling
    const rawPrice = foundPrice || req.body.price || req.body.Price || 0;
    console.log(`💰 Raw price value: ${rawPrice} (type: ${typeof rawPrice})`);
    
    let finalPrice = 0;
    
    // Handle different price formats
    if (rawPrice === null || rawPrice === undefined || rawPrice === '') {
      console.log('⚠️ Price is empty/null/undefined, using 0');
      finalPrice = 0;
    } else if (typeof rawPrice === 'string') {
      // Remove any currency symbols and commas
      const cleaned = rawPrice.replace(/[$,₹€£]/g, '').replace(/,/g, '').trim();
      finalPrice = parseFloat(cleaned) || 0;
      console.log(`💰 Cleaned price string "${rawPrice}" to "${cleaned}" = ${finalPrice}`);
    } else if (typeof rawPrice === 'number') {
      finalPrice = rawPrice;
    } else {
      // Try to convert anything else
      finalPrice = parseFloat(rawPrice) || 0;
    }
    
    // Ensure price is not negative
    if (finalPrice < 0) {
      finalPrice = 0;
    }
    
    console.log(`✅ Final price to save: ${finalPrice}`);
    
    // Prepare order data
    const orderData = {
      productId: String(req.body.productId || req.body.productID || '').trim(),
      productName: String(req.body.productName || req.body.productname || req.body.title || '').trim(),
      buyerName: String(req.body.buyerName || req.body.buyername || req.body.name || '').trim(),
      email: String(req.body.email || req.body.Email || '').trim().toLowerCase(),
      quantity: Math.max(1, parseInt(req.body.quantity || req.body.Quantity || 1)),
      price: finalPrice,
      address: String(req.body.address || req.body.Address || req.body.shippingAddress || '').trim(),
      phone: String(req.body.phone || req.body.Phone || req.body.telephone || req.body.mobile || '').trim(),
      date: req.body.date || req.body.Date || new Date().toISOString(),
      additionalNotes: String(req.body.additionalNotes || req.body.notes || req.body.comments || '').trim(),
      status: 'pending'
    };
    
    console.log('✅ Processed order data:', orderData);
    
    // Create and save order
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    console.log(`🎉 Order created successfully! ID: ${savedOrder._id}`);
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: savedOrder
    });
    
  } catch (error) {
    console.error('❌ ========== ERROR DETAILS ==========');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
    
    console.error('Full error:', error);
    console.error('❌ ===================================');
    
    let statusCode = 500;
    let errorMessage = 'Server error occurred';
    
    if (error.name === 'ValidationError') {
      statusCode = 400;
      const messages = Object.values(error.errors).map(err => err.message);
      errorMessage = messages.length > 0 ? messages.join(', ') : 'Validation failed';
    } else if (error.code === 11000) {
      statusCode = 400;
      errorMessage = 'Duplicate order detected';
    }
    
    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack
      })
    });
  }
};

module.exports = {
  createOrder,
  logRawBody // Export the middleware
};