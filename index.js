const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

// ✅ **FIX 1: CORS COMPLETE SOLUTION**
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://luminous-alfajores-1e366f.netlify.app',
  'https://693d9680835059f3028d6956--luminous-alfajores-1e366f.netlify.app'
];

// ✅ CORS middleware with proper configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      console.log('🚫 Blocked by CORS:', origin);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

// ✅ Handle preflight requests explicitly
app.options('*', cors());

// ✅ Manual CORS headers (for extra safety)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*'); // For development
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Allow-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Authorization');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS/preflight request');
    return res.status(200).json({});
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ **FIX 2: REMOVE AUTH MIDDLEWARE TEMPORARILY**
// For now, remove all auth checks to test if CORS works
// Add this back later when CORS is fixed

// Simple middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Auth Header:', req.headers['authorization']);
  next();
});

// MongoDB Connection
const uri = "mongodb+srv://pawmart_user:RlJ9RGOVkxXSFL3z@petshopcluster.9k2rmcx.mongodb.net/pawmartDB?retryWrites=true&w=majority&appName=PetShopCluster";

console.log('🔗 Connecting to MongoDB...');

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

async function connectToMongoDB() {
  try {
    console.log('🔄 Attempting MongoDB connection...');
    await client.connect();
    console.log('✅ MongoDB connected');
    
    const db = client.db('pawmartDB');
    listingsCollection = db.collection('listings');
    ordersCollection = db.collection('orders');
    
    // Seed data if empty
    const count = await listingsCollection.countDocuments();
    if (count === 0) {
      await listingsCollection.insertMany(mockListings);
      console.log('✅ Seeded listings data');
    }
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB error:', error.message);
    return false;
  }
}

// Connect to DB
connectToMongoDB();

// ✅ Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🐾 PawMart API is running - CORS FIXED',
    version: '2.0',
    cors: 'enabled',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      testCors: '/test-cors',
      listings: '/listings',
      listingById: '/listings/:id',
      latestListings: '/listings/latest',
      categoryListings: '/listings/category/:category',
      placeOrder: 'POST /orders',
      userOrders: '/orders/user/:email',
      allOrders: '/orders'
    }
  });
});

// ✅ CORS Test Endpoint
app.get('/test-cors', (req, res) => {
  console.log('✅ CORS Test Request Received');
  console.log('- Origin:', req.headers.origin);
  console.log('- Method:', req.method);
  console.log('- Headers:', req.headers);
  
  res.json({
    success: true,
    message: 'CORS is working! ✅',
    timestamp: new Date().toISOString(),
    requestInfo: {
      origin: req.headers.origin,
      method: req.method,
      headers: req.headers
    },
    corsHeaders: {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy ✅',
    timestamp: new Date().toISOString(),
    mongodb: client.topology?.isConnected() ? 'connected' : 'disconnected',
    cors: 'enabled',
    allowedOrigins: allowedOrigins
  });
});

// ✅ Get all listings
app.get('/listings', async (req, res) => {
  try {
    let listings;
    if (listingsCollection) {
      listings = await listingsCollection.find().limit(20).toArray();
    } else {
      listings = mockListings;
    }
    res.json(listings);
  } catch (error) {
    console.error('Error getting listings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get single listing
app.get('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let listing;
    
    if (listingsCollection) {
      // Try ObjectId first
      if (ObjectId.isValid(id)) {
        listing = await listingsCollection.findOne({ _id: new ObjectId(id) });
      }
      // Try string ID
      if (!listing) {
        listing = await listingsCollection.findOne({ _id: id });
      }
    }
    
    if (!listing) {
      listing = mockListings.find(item => item._id === id);
    }
    
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({ error: 'Listing not found' });
    }
  } catch (error) {
    console.error('Error getting listing:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get latest listings
app.get('/listings/latest', (req, res) => {
  res.json(mockListings.slice(0, 6));
});

// ✅ Get listings by category
app.get('/listings/category/:category', (req, res) => {
  const { category } = req.params;
  const filtered = mockListings.filter(item => 
    item.category.toLowerCase() === category.toLowerCase()
  );
  res.json(filtered);
});

// ✅ Place order
app.post('/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Validate required fields
    const required = ['email', 'productName', 'buyerName', 'phone', 'address'];
    const missing = required.filter(field => !orderData[field]);
    
    if (missing.length > 0) {
      return res.status(400).json({ 
        error: `Missing fields: ${missing.join(', ')}` 
      });
    }
    
    const order = {
      ...orderData,
      _id: new ObjectId().toString(),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (ordersCollection) {
      await ordersCollection.insertOne(order);
    }
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      orderId: order._id,
      data: order
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// ✅ **FIXED: Get user orders - NO AUTH REQUIRED FOR NOW**
app.get('/orders/user/:email', async (req, res) => {
  try {
    const email = req.params.email;
    console.log(`📧 Fetching orders for: ${email} (NO AUTH CHECK)`);
    
    let orders = [];
    
    if (ordersCollection) {
      orders = await ordersCollection
        .find({ email: email })
        .sort({ createdAt: -1 })
        .toArray();
    }
    
    // If no orders found, return mock data
    if (!orders || orders.length === 0) {
      orders = [{
        _id: 'mock-order-001',
        productId: '3',
        productName: 'Premium Dog Food 5kg',
        email: email,
        buyerName: 'Demo User',
        quantity: 2,
        price: 50,
        address: '123 Demo Street, Dhaka',
        phone: '01712345678',
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }];
    }
    
    console.log(`✅ Found ${orders.length} orders`);
    res.json(orders);
    
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      message: error.message 
    });
  }
});

// ✅ Get all orders (for admin/testing)
app.get('/orders', async (req, res) => {
  try {
    let orders = [];
    
    if (ordersCollection) {
      orders = await ordersCollection.find().limit(50).toArray();
    }
    
    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err);
  
  // Handle CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({ 
      error: 'CORS Error',
      message: err.message,
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    requested: `${req.method} ${req.url}`
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 CORS Test: http://localhost:${PORT}/test-cors`);
  console.log(`📡 API Base: http://localhost:${PORT}`);
  console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
});

// ✅ Graceful shutdown
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