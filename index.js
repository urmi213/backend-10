const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// ========== CORS CONFIGURATION - FIXED ==========
// সরাসরি CORS headers set করুন
app.use((req, res, next) => {
  // Allow all origins for development
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }
  
  next();
});

// Additional CORS middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// ========== MongoDB Connection ==========
const uri = "mongodb+srv://pawmart_user:RlJ9RGOVkxXSFL3z@petshopcluster.9k2rmcx.mongodb.net/pawmartDB?retryWrites=true&w=majority&appName=PetShopCluster";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

let listingsCollection = null;
let ordersCollection = null;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ MongoDB connected successfully');
    
    const db = client.db('pawmartDB');
    listingsCollection = db.collection('listings');
    ordersCollection = db.collection('orders');
    
    console.log('📊 Collections initialized');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
}

connectToMongoDB();

// ========== ALL ROUTES ==========

// 1. ROOT ENDPOINT
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🐾 PawMart Backend API v1.0',
    timestamp: new Date().toISOString(),
    cors: 'enabled (origin: *)',
    endpoints: [
      'GET  /health',
      'GET  /test-cors',
      'GET  /listings',
      'GET  /listings/:id',
      'GET  /orders',
      'GET  /orders/user/:email',
      'POST /orders'
    ]
  });
});

// 2. HEALTH CHECK - PUBLIC NO AUTH REQUIRED
app.get('/health', (req, res) => {
  // Explicit CORS headers for health endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  res.json({
    success: true,
    status: 'healthy ✅',
    timestamp: new Date().toISOString(),
    mongodb: client.topology?.isConnected() ? 'connected' : 'disconnected',
    cors: 'enabled',
    allowedOrigin: '*',
    server: {
      uptime: process.uptime(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// 3. CORS TEST ENDPOINT ✅
app.get('/test-cors', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  
  res.json({
    success: true,
    message: 'CORS is working perfectly! ✅',
    timestamp: new Date().toISOString(),
    requestInfo: {
      origin: req.headers.origin,
      method: req.method,
      userAgent: req.headers['user-agent']
    }
  });
});

// 4. ALL LISTINGS
app.get('/listings', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  
  try {
    let listings = [];
    
    if (listingsCollection) {
      listings = await listingsCollection.find({}).limit(50).toArray();
    }
    
    res.json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    console.error('Error in /listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listings'
    });
  }
});

// 5. SINGLE LISTING BY ID
app.get('/listings/:id', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  
  try {
    const id = req.params.id;
    let listing = null;
    
    if (listingsCollection) {
      if (ObjectId.isValid(id)) {
        listing = await listingsCollection.findOne({ _id: new ObjectId(id) });
      }
      if (!listing) {
        listing = await listingsCollection.findOne({ _id: id });
      }
    }
    
    if (listing) {
      res.json({
        success: true,
        data: listing
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Listing not found'
      });
    }
  } catch (error) {
    console.error('Error in /listings/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listing'
    });
  }
});

// 6. ALL ORDERS ✅
app.get('/orders', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  
  try {
    let orders = [];
    
    if (ordersCollection) {
      orders = await ordersCollection.find({}).limit(100).toArray();
    }
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error in /orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

// 7. USER ORDERS BY EMAIL ✅ - FIXED CORS
app.get('/orders/user/:email', async (req, res) => {
  // Set CORS headers specifically for this endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    const email = req.params.email;
    console.log(`📧 Fetching orders for: ${email}`);
    
    let orders = [];
    
    if (ordersCollection) {
      orders = await ordersCollection
        .find({ email: email })
        .sort({ createdAt: -1 })
        .toArray();
    }
    
    console.log(`✅ Found ${orders.length} orders for ${email}`);
    
    // Return the array directly as your frontend expects
    res.json(orders);
    
  } catch (error) {
    console.error('Error in /orders/user/:email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user orders',
      message: error.message
    });
  }
});

// 8. CREATE NEW ORDER
app.post('/orders', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST');
  
  try {
    const orderData = req.body;
    console.log('📦 New order received:', orderData);
    
    // Validation
    const requiredFields = ['email', 'productName', 'buyerName', 'phone', 'address'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const order = {
      ...orderData,
      _id: new ObjectId().toString(),
      status: orderData.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to database if available
    if (ordersCollection) {
      await ordersCollection.insertOne(order);
      console.log('✅ Order saved to MongoDB');
    } else {
      console.log('✅ Order processed (mock mode)');
    }
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully! 🎉',
      orderId: order._id,
      data: order
    });
    
  } catch (error) {
    console.error('Error in POST /orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to place order'
    });
  }
});

// 9. UPDATE ORDER STATUS
app.patch('/orders/:id', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PATCH');
  
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }
    
    let result = null;
    
    if (ordersCollection) {
      if (ObjectId.isValid(orderId)) {
        result = await ordersCollection.updateOne(
          { _id: new ObjectId(orderId) },
          { $set: { status: status, updatedAt: new Date() } }
        );
      } else {
        result = await ordersCollection.updateOne(
          { _id: orderId },
          { $set: { status: status, updatedAt: new Date() } }
        );
      }
    }
    
    if (result && result.modifiedCount > 0) {
      res.json({
        success: true,
        message: 'Order status updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
  } catch (error) {
    console.error('Error in PATCH /orders/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order'
    });
  }
});

// 10. DELETE ORDER
app.delete('/orders/:id', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'DELETE');
  
  try {
    const orderId = req.params.id;
    
    let result = null;
    
    if (ordersCollection) {
      if (ObjectId.isValid(orderId)) {
        result = await ordersCollection.deleteOne({ _id: new ObjectId(orderId) });
      } else {
        result = await ordersCollection.deleteOne({ _id: orderId });
      }
    }
    
    if (result && result.deletedCount > 0) {
      res.json({
        success: true,
        message: 'Order deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
  } catch (error) {
    console.error('Error in DELETE /orders/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete order'
    });
  }
});

// 11. ADD NEW LISTING
app.post('/listings', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST');
  
  try {
    const listingData = req.body;
    
    // Validation
    const requiredFields = ['name', 'category', 'price', 'location', 'description', 'sellerName', 'email'];
    const missingFields = requiredFields.filter(field => !listingData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const listing = {
      ...listingData,
      _id: new ObjectId().toString(),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to database if available
    if (listingsCollection) {
      await listingsCollection.insertOne(listing);
      console.log('✅ Listing saved to MongoDB');
    }
    
    res.status(201).json({
      success: true,
      message: 'Listing added successfully!',
      data: listing
    });
    
  } catch (error) {
    console.error('Error in POST /listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add listing'
    });
  }
});

// ========== ERROR HANDLING ==========

// 404 - Route not found
app.use('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET  /',
      'GET  /health',
      'GET  /test-cors',
      'GET  /listings',
      'GET  /listings/:id',
      'GET  /orders',
      'GET  /orders/user/:email',
      'POST /orders',
      'PATCH /orders/:id',
      'DELETE /orders/:id',
      'POST /listings'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  
  console.error('🔥 Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========== START SERVER ==========
app.listen(port, () => {
  console.log(`
🚀 Server running on port ${port}
🌐 Local: http://localhost:${port}
📡 Health: http://localhost:${port}/health
🔗 CORS Test: http://localhost:${port}/test-cors

✅ CORS is ENABLED for ALL origins (*)
✅ All endpoints are READY
✅ MongoDB: ${client.topology?.isConnected() ? 'Connected' : 'Disconnected'}
  `);
});

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  try {
    if (client) {
      await client.close();
      console.log('✅ MongoDB connection closed');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});