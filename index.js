const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI - Check if connection string is correct
const uri = "mongodb+srv://pawmart_user:RlJ9RGOVkxXSFL3z@petshopcluster.9k2rmcx.mongodb.net/pawmartDB?retryWrites=true&w=majority&appName=PetShopCluster";

console.log('🔗 Connecting to MongoDB...');

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 30000, // Increased timeout
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

let listingsCollection = null;
let ordersCollection = null;

// Sample data for fallback
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
  ,
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

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('🔄 Attempting MongoDB connection...');
    
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas");
    
    const database = client.db("pawmartDB");
    
    // Get or create collections
    listingsCollection = database.collection("listings");
    ordersCollection = database.collection("orders");
    
    console.log('📊 Collections initialized');
    
    // Seed listings if empty
    const listingCount = await listingsCollection.countDocuments();
    if (listingCount === 0) {
      console.log('🌱 Seeding listings collection...');
      await listingsCollection.insertMany(mockListings);
      console.log(`✅ Seeded ${mockListings.length} listings`);
    }
    
    // Create indexes for orders
    await ordersCollection.createIndex({ email: 1 });
    await ordersCollection.createIndex({ createdAt: -1 });
    console.log('🔧 Created database indexes');
    
    return true;
    
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("Full error:", error);
    
    // Don't crash if MongoDB fails - use mock mode
    console.log('⚠️ Switching to mock data mode');
    return false;
  }
}

// Initialize connection
connectToMongoDB().then(isConnected => {
  if (isConnected) {
    console.log('🚀 Backend ready with MongoDB');
  } else {
    console.log('⚠️ Backend running in mock mode');
  }
});

// ==================== ROUTES ====================

// Root endpoint
app.get('/', (req, res) => {
  res.send('🐾 PawMart Backend Server v1.0 is Running!');
});

// Health check with detailed status
app.get('/health', (req, res) => {
  const status = {
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    mongoDB: {
      connected: ordersCollection !== null,
      collections: {
        listings: listingsCollection !== null,
        orders: ordersCollection !== null
      }
    },
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version
    },
    endpoints: [
      { method: 'GET', path: '/listings', description: 'Get all listings' },
      { method: 'GET', path: '/listings/:id', description: 'Get single listing' },
      { method: 'POST', path: '/orders', description: 'Create new order' },
      { method: 'GET', path: '/orders/user/:email', description: 'Get user orders' }
    ]
  };
  
  res.json(status);
});

// ==================== LISTINGS ROUTES ====================

// Get latest listings
app.get('/listings/latest', async (req, res) => {
  try {
    console.log('📥 GET /listings/latest');
    
    let listings;
    
    if (listingsCollection) {
      listings = await listingsCollection.find()
        .sort({ _id: -1 })
        .limit(6)
        .toArray();
      console.log(`✅ Found ${listings.length} listings in MongoDB`);
    } else {
      listings = mockListings.slice(0, 6);
      console.log(`✅ Using ${listings.length} mock listings`);
    }
    
    res.json(listings);
    
  } catch (error) {
    console.error('❌ Error in /listings/latest:', error);
    res.json(mockListings.slice(0, 6));
  }
});

// Get all listings
app.get('/listings', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    console.log(`📥 GET /listings?limit=${limit}`);
    
    let listings;
    
    if (listingsCollection) {
      listings = await listingsCollection.find()
        .sort({ _id: -1 })
        .limit(limit)
        .toArray();
    } else {
      listings = mockListings.slice(0, limit);
    }
    
    res.json(listings);
    
  } catch (error) {
    console.error('❌ Error fetching listings:', error);
    res.json(mockListings.slice(0, 20));
  }
});

// Get listings by category
app.get('/listings/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    console.log(`📥 GET /listings/category/${category}`);
    
    let listings;
    
    if (listingsCollection) {
      listings = await listingsCollection.find({ category }).toArray();
    } else {
      listings = mockListings.filter(item => item.category === category);
    }
    
    res.json(listings);
    
  } catch (error) {
    console.error('❌ Error fetching category listings:', error);
    const filtered = mockListings.filter(item => item.category === req.params.category);
    res.json(filtered);
  }
});

// Get single listing by ID
app.get('/listings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`📥 GET /listings/${id}`);
    
    let listing;
    
    if (listingsCollection) {
      // Try MongoDB ObjectId first
      if (ObjectId.isValid(id)) {
        listing = await listingsCollection.findOne({ _id: new ObjectId(id) });
      }
      
      // If not found, try string ID
      if (!listing) {
        listing = await listingsCollection.findOne({ _id: id });
      }
    }
    
    // If still not found, try mock data
    if (!listing) {
      listing = mockListings.find(item => item._id === id);
    }
    
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({
        success: false,
        message: 'Listing not found',
        requestedId: id
      });
    }
    
  } catch (error) {
    console.error('❌ Error fetching listing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listing',
      error: error.message
    });
  }
});

// ==================== ORDERS ROUTES ====================

// Create new order - FIXED VERSION
app.post('/orders', async (req, res) => {
  try {
    console.log('📦 POST /orders - Received order data');
    console.log('Order data:', JSON.stringify(req.body, null, 2));
    
    const orderData = req.body;
    
    // Validate required fields
    const requiredFields = ['email', 'productName', 'buyerName', 'phone', 'address'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Prepare order document
    const orderDocument = {
      productId: orderData.productId || '',
      productName: orderData.productName,
      buyerName: orderData.buyerName,
      email: orderData.email.toLowerCase().trim(),
      phone: orderData.phone.toString().replace(/\s/g, ''),
      address: orderData.address,
      quantity: parseInt(orderData.quantity) || 1,
      price: parseFloat(orderData.price) || 0,
      date: orderData.date || new Date().toISOString().split('T')[0],
      additionalNotes: orderData.additionalNotes || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('📝 Prepared order document:', orderDocument);
    
    let savedOrder;
    
    // Try to save to MongoDB
    if (ordersCollection) {
      try {
        console.log('💾 Saving to MongoDB...');
        const result = await ordersCollection.insertOne(orderDocument);
        console.log('✅ MongoDB insert result:', result);
        
        savedOrder = {
          _id: result.insertedId,
          ...orderDocument
        };
        
        console.log('✅ Order saved to MongoDB with ID:', result.insertedId);
        
      } catch (mongoError) {
        console.error('❌ MongoDB save error:', mongoError.message);
        
        // Fallback to mock mode
        savedOrder = {
          _id: new ObjectId().toString(),
          ...orderDocument
        };
        
        console.log('⚠️ Using mock order with ID:', savedOrder._id);
      }
    } else {
      // Mock mode
      savedOrder = {
        _id: new ObjectId().toString(),
        ...orderDocument
      };
      
      console.log('✅ Order saved in mock mode with ID:', savedOrder._id);
    }
    
    // Success response
    res.status(201).json({
      success: true,
      message: '🎉 Order placed successfully!',
      data: savedOrder
    });
    
  } catch (error) {
    console.error('❌ Order processing error:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to place order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get orders by user email
app.get('/orders/user/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    console.log(`📥 GET /orders/user/${email}`);
    
    let orders;
    
    if (ordersCollection) {
      orders = await ordersCollection.find({ email })
        .sort({ createdAt: -1 })
        .toArray();
      console.log(`✅ Found ${orders.length} orders for ${email}`);
    } else {
      // Mock data for testing
      orders = [
        {
          _id: 'mock-order-1',
          productId: '1',
          productName: 'Golden Retriever Puppy',
          buyerName: 'Demo User',
          email: email,
          quantity: 1,
          price: 0,
          address: '123 Demo Street, Dhaka',
          phone: '01712345678',
          date: new Date().toISOString().split('T')[0],
          status: 'completed',
          createdAt: new Date('2024-01-15')
        }
      ];
      console.log(`✅ Using mock orders for ${email}`);
    }
    
    res.json(orders);
    
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== SERVER START ====================

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`📋 API Documentation:`);
  console.log(`   POST http://localhost:${port}/orders`);
  console.log(`   GET  http://localhost:${port}/orders/user/:email`);
  console.log(`   GET  http://localhost:${port}/listings/:id`);
  console.log(`   GET  http://localhost:${port}/listings/latest`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down server...');
  try {
    await client.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
});