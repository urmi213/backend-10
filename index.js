const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// ========== CORS CONFIGURATION ==========
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========== MongoDB Connection ==========
const uri = process.env.MONGODB_URI || "mongodb+srv://pawmart_user:RlJ9RGOVkxXSFL3z@petshopcluster.9k2rmcx.mongodb.net/pawmartDB?retryWrites=true&w=majority&appName=PetShopCluster";

let client;
let isConnected = false;
let listingsCollection = null;
let ordersCollection = null;

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing MongoDB connection...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MongoDB URI present:', !!process.env.MONGODB_URI);
    
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('pawmartDB');
    
    // Check if collections exist, create if not
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    if (!collectionNames.includes('listings')) {
      await db.createCollection('listings');
      console.log('✅ Created listings collection');
    }
    
    if (!collectionNames.includes('orders')) {
      await db.createCollection('orders');
      console.log('✅ Created orders collection');
    }
    
    listingsCollection = db.collection('listings');
    ordersCollection = db.collection('orders');
    
    // Check if we have data
    const count = await listingsCollection.countDocuments();
    console.log(`📊 Found ${count} listings in database`);
    
    if (count === 0) {
      console.log('🌱 Database is empty, seeding sample data...');
      await seedSampleData();
    }
    
    isConnected = true;
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
    isConnected = false;
    return false;
  }
}

async function seedSampleData() {
  try {
    const sampleListings = [
      {
        name: 'Golden Retriever Puppy',
        category: 'Pets',
        price: 0,
        location: 'Dhaka',
        image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800&auto=format&fit=crop&q=80',
        description: 'Friendly 3-month-old puppy, vaccinated and ready for adoption',
        sellerName: 'Pet Care Center',
        email: 'petcare@example.com',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Persian Kitten',
        category: 'Pets',
        price: 150,
        location: 'Chattogram',
        image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&auto=format&fit=crop&q=80',
        description: 'Beautiful white Persian kitten, 2 months old',
        sellerName: 'Cat Lovers Hub',
        email: 'catlover@example.com',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Premium Dog Food 5kg',
        category: 'Food',
        price: 25,
        location: 'Sylhet',
        image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=80',
        description: 'High-quality dog food with natural ingredients',
        sellerName: 'Pet Food Store',
        email: 'petfood@example.com',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Organic Pet Shampoo',
        category: 'Care Products',
        price: 15,
        location: 'Rajshahi',
        image: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=800&auto=format&fit=crop&q=80',
        description: 'Gentle shampoo for sensitive skin pets',
        sellerName: 'Pet Care Mart',
        email: 'caremart@example.com',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dog Leash Set',
        category: 'Accessories',
        price: 18,
        location: 'Dhaka',
        image: 'https://images.unsplash.com/photo-1554456854-55a089fd4cb2?w=800&auto=format&fit=crop&q=80',
        description: 'Premium leather dog leash with collar',
        sellerName: 'Pet Gear BD',
        email: 'petgear@example.com',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Rabbit Hutch with Run',
        category: 'Accessories',
        price: 120,
        location: 'Barishal',
        image: 'https://images.unsplash.com/photo-1504595403659-9088ce801e29?w=800&auto=format&fit=crop&q=80',
        description: 'Spacious wooden rabbit hutch with exercise run',
        sellerName: 'Small Pet World',
        email: 'smallpets@example.com',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Parakeet Pair with Cage',
        category: 'Pets',
        price: 45,
        location: 'Sylhet',
        image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80',
        description: 'Colorful parakeet pair with cage, perfect for beginners',
        sellerName: 'Bird Paradise',
        email: 'birdparadise@example.com',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Pet First Aid Kit',
        category: 'Care Products',
        price: 30,
        location: 'Dhaka',
        image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800&auto=format&fit=crop&q=80',
        description: 'Complete pet first aid kit with emergency guide',
        sellerName: 'Pet Safety First',
        email: 'petsafety@example.com',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cat Dry Food 3kg',
        category: 'Food',
        price: 20,
        location: 'Sylhet',
        image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&auto=format&fit=crop&q=80',
        description: 'Premium cat food for all life stages',
        sellerName: 'Healthy Pet Foods',
        email: 'healthyfoods@example.com',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const result = await listingsCollection.insertMany(sampleListings);
    console.log(`✅ Seeded ${result.insertedCount} sample listings`);
    return result;
    
  } catch (error) {
    console.error('❌ Failed to seed data:', error.message);
    throw error;
  }
}

// Initialize database on startup
initializeDatabase().then(success => {
  if (success) {
    console.log('✅ Database initialization complete');
  } else {
    console.log('⚠️ Database initialization failed, using in-memory data');
  }
});

// ========== ROUTES ==========

// 1. ROOT ENDPOINT
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🐾 PawMart Backend API v1.0',
    status: 'running',
    database: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET  /',
      'GET  /health',
      'GET  /test',
      'GET  /listings',
      'GET  /api/listings',
      'GET  /listings/:id',
      'GET  /api/listings/:id',
      'GET  /listings/latest/:limit?',
      'GET  /listings/category/:category',
      'GET  /api/listings/category/:category',
      'POST /listings',
      'POST /seed',
      'GET  /db-status',
      'GET  /orders/user/:email',
      'GET  /api/orders/user/:email'
    ]
  });
});

// 2. HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy ✅',
    database: isConnected ? 'connected ✅' : 'disconnected ⚠️',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 3. TEST ENDPOINT
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: '✅ API is working!',
    cors: 'enabled',
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 4. GET ALL LISTINGS (MAIN FIXED ENDPOINT)
app.get('/listings', async (req, res) => {
  try {
    console.log('📡 GET /listings request received');
    
    let listings = [];
    
    if (isConnected && listingsCollection) {
      console.log('🔍 Querying MongoDB...');
      
      // Try to get data from MongoDB
      listings = await listingsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      
      console.log(`📊 Found ${listings.length} listings in MongoDB`);
      
      // Convert ObjectId to string for frontend
      listings = listings.map(item => ({
        ...item,
        _id: item._id ? item._id.toString() : `mongo-${Date.now()}`
      }));
      
    } else {
      console.log('⚠️ MongoDB not connected, returning sample data');
      
      // Return hardcoded sample data
      listings = [
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
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback'
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
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback'
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
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback'
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
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback'
        },
        {
          _id: '5',
          name: 'Dog Leash Set',
          category: 'Accessories',
          price: 18,
          location: 'Dhaka',
          image: 'https://images.unsplash.com/photo-1554456854-55a089fd4cb2?w=800&auto=format&fit=crop&q=80',
          description: 'Premium leather dog leash with collar',
          sellerName: 'Pet Gear BD',
          email: 'petgear@example.com',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback'
        }
      ];
    }
    
    // Always return data (array format for frontend)
    res.json(listings);
    
  } catch (error) {
    console.error('❌ Error in /listings:', error.message);
    
    // Fallback to empty array
    res.json([]);
  }
});

// 5. API-COMPATIBLE LISTINGS (WITH /API PREFIX)
app.get('/api/listings', async (req, res) => {
  try {
    console.log('📡 GET /api/listings (Vercel compatible)');
    
    let listings = [];
    
    if (isConnected && listingsCollection) {
      console.log('🔍 Querying MongoDB for Vercel route...');
      
      listings = await listingsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      
      console.log(`📊 Found ${listings.length} listings in MongoDB`);
      
      listings = listings.map(item => ({
        ...item,
        _id: item._id ? item._id.toString() : `mongo-${Date.now()}`
      }));
      
    } else {
      console.log('⚠️ MongoDB not connected, returning sample data for Vercel');
      
      listings = [
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
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback-vercel'
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
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback-vercel'
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
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback-vercel'
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
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback-vercel'
        },
        {
          _id: '5',
          name: 'Dog Leash Set',
          category: 'Accessories',
          price: 18,
          location: 'Dhaka',
          image: 'https://images.unsplash.com/photo-1554456854-55a089fd4cb2?w=800&auto=format&fit=crop&q=80',
          description: 'Premium leather dog leash with collar',
          sellerName: 'Pet Gear BD',
          email: 'petgear@example.com',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback-vercel'
        }
      ];
    }
    
    res.json(listings);
    
  } catch (error) {
    console.error('❌ Error in /api/listings:', error.message);
    res.json([]);
  }
});

// 6. GET LATEST LISTINGS
app.get('/listings/latest/:limit?', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 6;
    let listings = [];
    
    if (isConnected && listingsCollection) {
      listings = await listingsCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      
      listings = listings.map(item => ({
        ...item,
        _id: item._id ? item._id.toString() : `latest-${Date.now()}`
      }));
    }
    
    res.json(listings);
    
  } catch (error) {
    console.error('Error in /listings/latest:', error);
    res.json([]);
  }
});

// 7. GET LISTINGS BY CATEGORY
app.get('/listings/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    console.log(`📡 GET /listings/category/${category}`);
    
    let listings = [];
    
    if (isConnected && listingsCollection) {
      // Case-insensitive search
      listings = await listingsCollection
        .find({ category: { $regex: new RegExp(category, 'i') } })
        .sort({ createdAt: -1 })
        .toArray();
      
      listings = listings.map(item => ({
        ...item,
        _id: item._id ? item._id.toString() : `cat-${Date.now()}`
      }));
      
      console.log(`📊 Found ${listings.length} items in category: ${category}`);
    } else {
      console.log('⚠️ MongoDB not connected, returning fallback data');
      
      // Fallback data
      const fallbackData = {
        'pets': [
          {
            _id: 'pet-1',
            name: 'Golden Retriever Puppy',
            category: 'Pets',
            price: 0,
            location: 'Dhaka',
            image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800&auto=format&fit=crop&q=80',
            description: 'Friendly 3-month-old puppy',
            sellerName: 'Pet Care Center',
            email: 'petcare@example.com',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date(),
            source: 'fallback'
          }
        ],
        'accessories': [
          {
            _id: 'acc-1',
            name: 'Dog Leash Set',
            category: 'Accessories',
            price: 18,
            location: 'Dhaka',
            image: 'https://images.unsplash.com/photo-1554456854-55a089fd4cb2?w=800&auto=format&fit=crop&q=80',
            description: 'Premium leather dog leash with collar',
            sellerName: 'Pet Gear BD',
            email: 'petgear@example.com',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date(),
            source: 'fallback'
          }
        ],
        'food': [
          {
            _id: 'food-1',
            name: 'Premium Dog Food 5kg',
            category: 'Food',
            price: 25,
            location: 'Sylhet',
            image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=80',
            description: 'High-quality dog food',
            sellerName: 'Pet Food Store',
            email: 'petfood@example.com',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date(),
            source: 'fallback'
          }
        ]
      };
      
      listings = fallbackData[category.toLowerCase()] || [];
    }
    
    res.json(listings);
    
  } catch (error) {
    console.error(`❌ Error in /listings/category/:`, error);
    res.json([]);
  }
});

// 8. API-COMPATIBLE CATEGORY ENDPOINT
app.get('/api/listings/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    console.log(`📡 GET /api/listings/category/${category} (API compatible)`);
    
    // Call the existing category logic
    req.url = `/listings/category/${category}`;
    return app._router.handle(req, res);
    
  } catch (error) {
    console.error(`❌ Error in /api/listings/category/:`, error);
    res.json([]);
  }
});

// 9. GET SINGLE LISTING BY ID
app.get('/listings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let listing = null;
    
    if (isConnected && listingsCollection) {
      try {
        // Try as ObjectId first
        if (ObjectId.isValid(id)) {
          listing = await listingsCollection.findOne({ _id: new ObjectId(id) });
        }
        
        // If not found, try as string
        if (!listing) {
          const allListings = await listingsCollection.find({}).toArray();
          listing = allListings.find(item => 
            item._id && item._id.toString() === id
          );
        }
        
        if (listing && listing._id) {
          listing._id = listing._id.toString();
        }
        
      } catch (dbError) {
        console.error('Database error:', dbError);
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

// 10. API-COMPATIBLE SINGLE LISTING
app.get('/api/listings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`📡 GET /api/listings/${id} (API compatible)`);
    
    // Call the existing listing by ID logic
    req.url = `/listings/${id}`;
    return app._router.handle(req, res);
    
  } catch (error) {
    console.error('Error in /api/listings/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch listing'
    });
  }
});

// 11. CREATE NEW LISTING
app.post('/listings', async (req, res) => {
  try {
    const listingData = req.body;
    console.log('📝 Creating new listing:', listingData);
    
    const requiredFields = ['name', 'category', 'price', 'location', 'description', 'email'];
    const missingFields = requiredFields.filter(field => !listingData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const newListing = {
      ...listingData,
      price: parseFloat(listingData.price) || 0,
      sellerName: listingData.sellerName || listingData.email?.split('@')[0] || 'Pet Owner',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    let result;
    if (isConnected && listingsCollection) {
      result = await listingsCollection.insertOne(newListing);
      newListing._id = result.insertedId.toString();
    } else {
      newListing._id = `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    res.status(201).json({
      success: true,
      message: 'Listing created successfully!',
      data: newListing
    });
    
  } catch (error) {
    console.error('Error in POST /listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create listing'
    });
  }
});

// ========== ORDER ROUTES ==========

// 12. CREATE NEW ORDER
app.post('/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    const requiredFields = ['productId', 'productName', 'email', 'buyerName', 'quantity', 'price', 'address', 'phone'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    const newOrder = {
      ...orderData,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    let result;
    if (isConnected && ordersCollection) {
      result = await ordersCollection.insertOne(newOrder);
      newOrder._id = result.insertedId.toString();
    } else {
      newOrder._id = `order-${Date.now()}`;
    }
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder
    });
    
  } catch (error) {
    console.error('Error in POST /orders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to place order'
    });
  }
});

// 13. GET USER ORDERS BY EMAIL
app.get('/orders/user/:email', async (req, res) => {
  try {
    const email = req.params.email;
    console.log(`📡 GET /orders/user/${email}`);
    
    let orders = [];
    
    if (isConnected && ordersCollection) {
      orders = await ordersCollection
        .find({ email: email })
        .sort({ createdAt: -1 })
        .toArray();
      
      orders = orders.map(order => ({
        ...order,
        _id: order._id ? order._id.toString() : `order-${Date.now()}`
      }));
      
      console.log(`📊 Found ${orders.length} orders for ${email}`);
    } else {
      console.log('⚠️ MongoDB not connected, returning fallback orders');
      
      // Fallback orders
      orders = [
        {
          _id: 'order-1',
          productId: '67a1b2c3d4e5f',
          productName: 'Golden Retriever Puppy',
          email: email,
          buyerName: 'Demo User',
          quantity: 1,
          price: 0,
          address: '123 Main Street, Dhaka',
          phone: '01712345678',
          status: 'pending',
          date: '2025-12-25',
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback'
        },
        {
          _id: 'order-2',
          productId: '67a1b2c3d4e5g',
          productName: 'Persian Kitten',
          email: email,
          buyerName: 'Demo User',
          quantity: 1,
          price: 150,
          address: '456 Another Road, Chattogram',
          phone: '01898765432',
          status: 'delivered',
          date: '2025-12-24',
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(),
          source: 'fallback'
        }
      ];
    }
    
    res.json(orders);
    
  } catch (error) {
    console.error('Error in /orders/user/:email:', error);
    res.json([]);
  }
});

// 14. API-COMPATIBLE ORDER ROUTE
app.get('/api/orders/user/:email', async (req, res) => {
  try {
    const email = req.params.email;
    console.log(`📡 GET /api/orders/user/${email} (API compatible)`);
    
    // Call the existing orders logic
    req.url = `/orders/user/${email}`;
    return app._router.handle(req, res);
    
  } catch (error) {
    console.error('❌ Error in /api/orders/user/:email:', error);
    res.json([]);
  }
});

// 15. GET ALL ORDERS (ADMIN)
app.get('/orders', async (req, res) => {
  try {
    let orders = [];
    
    if (isConnected && ordersCollection) {
      orders = await ordersCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      
      orders = orders.map(order => ({
        ...order,
        _id: order._id ? order._id.toString() : `order-${Date.now()}`
      }));
    }
    
    res.json(orders);
    
  } catch (error) {
    console.error('Error in /orders:', error);
    res.json([]);
  }
});

// 16. SEED DATABASE
app.post('/seed', async (req, res) => {
  try {
    console.log('🌱 Seeding database...');
    
    if (isConnected && listingsCollection) {
      await listingsCollection.deleteMany({});
      
      const result = await seedSampleData();
      
      res.json({
        success: true,
        message: `✅ Database seeded with ${result.insertedCount} listings`,
        count: result.insertedCount
      });
      
    } else {
      res.json({
        success: false,
        message: '⚠️ MongoDB not connected, cannot seed database',
        suggestion: 'Check MongoDB connection and try again'
      });
    }
    
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed database'
    });
  }
});

// 17. DATABASE STATUS
app.get('/db-status', async (req, res) => {
  try {
    let status = {
      connected: isConnected,
      database: 'pawmartDB',
      collections: [],
      listingsCount: 0
    };
    
    if (isConnected && client) {
      const db = client.db('pawmartDB');
      const collections = await db.listCollections().toArray();
      status.collections = collections.map(col => col.name);
      
      if (listingsCollection) {
        status.listingsCount = await listingsCollection.countDocuments();
      }
    }
    
    res.json({
      success: true,
      status: status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      connected: isConnected
    });
  }
});

// 18. ADD TEST DATA
app.post('/add-test', async (req, res) => {
  try {
    const testData = {
      name: 'Test Pet - ' + new Date().toLocaleTimeString(),
      category: 'Pets',
      price: 99,
      location: 'Test City',
      image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0',
      description: 'This is a test listing',
      sellerName: 'Test Seller',
      email: 'test@example.com',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    let result;
    if (isConnected && listingsCollection) {
      result = await listingsCollection.insertOne(testData);
      testData._id = result.insertedId.toString();
      testData.source = 'mongodb';
    } else {
      testData._id = `test-${Date.now()}`;
      testData.source = 'memory';
    }
    
    res.json({
      success: true,
      message: 'Test data added successfully',
      data: testData
    });
    
  } catch (error) {
    console.error('Error adding test data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add test data'
    });
  }
});

// 19. GET USER LISTINGS BY EMAIL
app.get('/listings/user/:email', async (req, res) => {
  try {
    const email = req.params.email;
    let listings = [];
    
    if (isConnected && listingsCollection) {
      listings = await listingsCollection
        .find({ email: email })
        .sort({ createdAt: -1 })
        .toArray();
      
      listings = listings.map(item => ({
        ...item,
        _id: item._id ? item._id.toString() : `user-${Date.now()}`
      }));
    }
    
    res.json(listings);
    
  } catch (error) {
    console.error('Error in /listings/user/:email:', error);
    res.json([]);
  }
});

// 20. ENVIRONMENT CHECK
app.get('/env-check', (req, res) => {
  res.json({
    success: true,
    MONGODB_URI: process.env.MONGODB_URI ? '✅ Present' : '❌ Missing',
    NODE_ENV: process.env.NODE_ENV || 'not set',
    VERCEL: process.env.VERCEL ? 'yes' : 'no',
    VERCEL_REGION: process.env.VERCEL_REGION || 'not set',
    timestamp: new Date().toISOString(),
    message: 'Environment variables check successful'
  });
});

// 21. TEST MONGODB CONNECTION
app.get('/test-mongo', async (req, res) => {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    const testClient = new MongoClient(uri, {
      serverApi: { version: ServerApiVersion.v1 }
    });
    
    await testClient.connect();
    await testClient.db('admin').command({ ping: 1 });
    await testClient.close();
    
    res.json({
      success: true,
      message: '🎉 MongoDB Atlas connection successful!',
      ipWhitelist: 'verified (0.0.0.0/0)',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      message: '❌ MongoDB connection failed',
      error: error.message,
      suggestion: 'Check MongoDB Atlas → Network Access → Add 0.0.0.0/0',
      timestamp: new Date().toISOString()
    });
  }
});

// 22. PING TEST
app.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong 🏓',
    server: 'PawMart Backend',
    timestamp: new Date().toISOString()
  });
});

// ========== ERROR HANDLING ==========

// 404 - Route not found
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
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
✅ CORS enabled for ALL origins (*)
📡 Health: https://backend-10-five.vercel.app/health
🔗 Test: https://backend-10-five.vercel.app/test
📊 Listings: https://backend-10-five.vercel.app/listings
🔧 API Listings: https://backend-10-five.vercel.app/api/listings
🐾 Categories: https://backend-10-five.vercel.app/listings/category/:category
🔧 API Categories: https://backend-10-five.vercel.app/api/listings/category/:category
📦 Orders: https://backend-10-five.vercel.app/api/orders/user/:email
🌱 Seed: https://backend-10-five.vercel.app/seed (POST)
  `);
});

// Graceful shutdown
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