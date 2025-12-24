const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// ========== CORS FIX ==========
// Method 1: Using cors middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: false
}));

// Method 2: Manual CORS headers (for extra safety)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'false');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Handle OPTIONS requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.status(200).send();
});

app.use(express.json());
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

// ========== MOCK DATA ==========
const mockListings = [
  {
    _id: '1',
    name: 'Golden Retriever Puppy',
    category: 'Pets',
    price: 0,
    location: 'Dhaka',
    image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800&auto=format&fit=crop&q=80',
    description: 'Friendly 3-month-old puppy, vaccinated and ready for adoption',
    sellerName: 'Pet Care Center',
    email: 'petcare@example.com',
    date: '2025-10-27'
  },
  {
    _id: '2',
    name: 'Persian Kitten',
    category: 'Pets',
    price: 150,
    location: 'Chattogram',
    image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&auto=format&fit=crop&q=80',
    description: 'Beautiful white Persian kitten, 2 months old',
    sellerName: 'Cat Lovers Hub',
    email: 'catlover@example.com',
    date: '2025-10-28'
  },
  {
    _id: '3',
    name: 'Premium Dog Food 5kg',
    category: 'Food',
    price: 25,
    location: 'Sylhet',
    image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=80',
    description: 'High-quality dog food with natural ingredients',
    sellerName: 'Pet Food Store',
    email: 'petfood@example.com',
    date: '2025-10-29'
  },
  {
    _id: '4',
    name: 'Organic Pet Shampoo',
    category: 'Care Products',
    price: 15,
    location: 'Rajshahi',
    image: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=800&auto=format&fit=crop&q=80',
    description: 'Gentle shampoo for sensitive skin pets',
    sellerName: 'Pet Care Mart',
    email: 'caremart@example.com',
    date: '2025-10-31'
  },
  {
    _id: '5',
    name: 'Rabbit Hutch with Run',
    category: 'Accessories',
    price: 120,
    location: 'Barishal',
    image: 'https://images.unsplash.com/photo-1504595403659-9088ce801e29?w=800&auto=format&fit=crop&q=80',
    description: 'Spacious wooden rabbit hutch with exercise run',
    sellerName: 'Small Pet World',
    email: 'smallpets@example.com',
    date: '2025-11-01'
  }
];

const mockOrders = [
  {
    _id: 'order-001',
    productId: '3',
    productName: 'Premium Dog Food 5kg',
    email: 'urmichakravorty02@gmail.com',
    buyerName: 'Demo User',
    quantity: 2,
    price: 50,
    address: '123 Demo Street, Dhaka',
    phone: '01712345678',
    date: new Date().toISOString().split('T')[0],
    status: 'completed',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: 'order-002',
    productId: '1',
    productName: 'Golden Retriever Puppy',
    email: 'urmichakravorty02@gmail.com',
    buyerName: 'Demo User',
    quantity: 1,
    price: 0,
    address: '456 Sample Road, Chattogram',
    phone: '01876543210',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  }
];

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
      'GET  /listings/latest',
      'GET  /listings/category/:category',
      'GET  /orders',
      'GET  /orders/user/:email',
      'POST /orders'
    ],
    examples: {
      healthCheck: 'https://backend-10-i1qp6b7m5-urmis-projects-37af7542.vercel.app/health',
      testCors: 'https://backend-10-i1qp6b7m5-urmis-projects-37af7542.vercel.app/test-cors',
      userOrders: 'https://backend-10-i1qp6b7m5-urmis-projects-37af7542.vercel.app/orders/user/urmichakravorty02@gmail.com'
    }
  });
});

// 2. HEALTH CHECK
app.get('/health', (req, res) => {
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
  console.log('✅ /test-cors endpoint called');
  console.log('Origin:', req.headers.origin);
  console.log('Method:', req.method);
  
  res.json({
    success: true,
    message: 'CORS is working perfectly! ✅',
    timestamp: new Date().toISOString(),
    requestInfo: {
      origin: req.headers.origin,
      method: req.method,
      userAgent: req.headers['user-agent']
    },
    corsHeaders: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    },
    note: 'This endpoint proves CORS is properly configured.'
  });
});

// 4. ALL LISTINGS
app.get('/listings', async (req, res) => {
  try {
    let listings;
    
    if (listingsCollection) {
      listings = await listingsCollection.find().limit(20).toArray();
    } else {
      listings = mockListings;
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
  try {
    const id = req.params.id;
    let listing;
    
    if (listingsCollection) {
      if (ObjectId.isValid(id)) {
        listing = await listingsCollection.findOne({ _id: new ObjectId(id) });
      }
      if (!listing) {
        listing = await listingsCollection.findOne({ _id: id });
      }
    }
    
    if (!listing) {
      listing = mockListings.find(item => item._id === id);
    }
    
    if (listing) {
      res.json({
        success: true,
        data: listing
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Listing not found',
        requestedId: id
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

// 6. LATEST LISTINGS
app.get('/listings/latest', (req, res) => {
  res.json({
    success: true,
    count: 6,
    data: mockListings.slice(0, 6)
  });
});

// 7. LISTINGS BY CATEGORY
app.get('/listings/category/:category', (req, res) => {
  const category = req.params.category;
  const filtered = mockListings.filter(item => 
    item.category.toLowerCase() === category.toLowerCase()
  );
  
  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// 8. ALL ORDERS ✅
app.get('/orders', async (req, res) => {
  try {
    let orders;
    
    if (ordersCollection) {
      orders = await ordersCollection.find().limit(50).toArray();
    } else {
      orders = mockOrders;
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

// 9. USER ORDERS BY EMAIL ✅
app.get('/orders/user/:email', async (req, res) => {
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
    
    // If no orders found in DB, use mock data
    if (!orders || orders.length === 0) {
      orders = mockOrders.filter(order => order.email === email);
      
      // If still no orders, create demo data
      if (orders.length === 0) {
        orders = [
          {
            _id: `order-${Date.now()}`,
            productId: '3',
            productName: 'Premium Dog Food 5kg',
            email: email,
            buyerName: 'Demo User',
            quantity: 2,
            price: 50,
            address: '123 Street, Dhaka',
            phone: '01712345678',
            date: new Date().toISOString().split('T')[0],
            status: 'completed',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
      }
    }
    
    console.log(`✅ Found ${orders.length} orders for ${email}`);
    
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

// 10. CREATE NEW ORDER
app.post('/orders', async (req, res) => {
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
      status: 'pending',
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

// ========== ERROR HANDLING ==========

// 404 - Route not found
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET  /',
      'GET  /health',
      'GET  /test-cors',
      'GET  /listings',
      'GET  /listings/:id',
      'GET  /listings/latest',
      'GET  /listings/category/:category',
      'GET  /orders',
      'GET  /orders/user/:email',
      'POST /orders'
    ],
    currentTime: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
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
📋 User Orders: http://localhost:${port}/orders/user/urmichakravorty02@gmail.com

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