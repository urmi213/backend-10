const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// ========== FIXED CORS CONFIGURATION ==========
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Accept-Encoding, Accept-Language'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'Pragma']
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========== MongoDB Connection ==========
const uri = "mongodb+srv://pawmart_user:RlJ9RGOVkxXSFL3z@petshopcluster.9k2rmcx.mongodb.net/pawmartDB?retryWrites=true&w=majority&appName=PetShopCluster";

let client;
let db;
let isConnected = false;
let listingsCollection = null;
let ordersCollection = null;

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing MongoDB connection...');
    
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
    
    db = client.db('pawmartDB');
    
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
        id: 1,
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
        id: 2,
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
        id: 3,
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
        id: 4,
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
        id: 5,
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
        id: 6,
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

// Initialize database
initializeDatabase().then(success => {
  if (success) {
    console.log('✅ Database initialization complete');
  } else {
    console.log('⚠️ Database initialization failed');
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
    timestamp: new Date().toISOString()
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

// 4. GET ALL LISTINGS
app.get('/listings', async (req, res) => {
  try {
    console.log('📡 GET /listings request');
    
    let listings = [];
    
    if (isConnected && listingsCollection) {
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
      console.log('⚠️ MongoDB not connected, returning sample data');
      
      listings = [
        {
          _id: '1',
          id: 1,
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
        },
        {
          _id: '2',
          id: 2,
          name: 'Persian Kitten',
          category: 'Pets',
          price: 150,
          location: 'Chattogram',
          image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&auto=format&fit=crop&q=80',
          description: 'Beautiful white Persian kitten',
          sellerName: 'Cat Lovers Hub',
          email: 'catlover@example.com',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback'
        }
      ];
    }
    
    res.json(listings);
    
  } catch (error) {
    console.error('❌ Error in /listings:', error.message);
    res.json([]);
  }
});

// 5. API-COMPATIBLE LISTINGS
app.get('/api/listings', async (req, res) => {
  try {
    console.log('📡 GET /api/listings');
    
    // Reuse the same logic from /listings
    req.url = '/listings';
    return app._router.handle(req, res);
    
  } catch (error) {
    console.error('❌ Error in /api/listings:', error.message);
    res.json([]);
  }
});

// 6. GET SINGLE LISTING BY ID
app.get('/listings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`📡 GET /listings/${id}`);
    
    let listing = null;
    
    if (isConnected && listingsCollection) {
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        listing = await listingsCollection.findOne({ id: numericId });
      }
      
      if (!listing && ObjectId.isValid(id)) {
        listing = await listingsCollection.findOne({ _id: new ObjectId(id) });
      }
      
      if (listing) {
        listing._id = listing._id ? listing._id.toString() : id;
        if (!listing.id && !isNaN(parseInt(id))) {
          listing.id = parseInt(id);
        }
        console.log(`✅ Found listing: ${listing.name}`);
      }
    }
    
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({
        success: false,
        error: `Listing with ID ${id} not found`
      });
    }
    
  } catch (error) {
    console.error(`❌ Error in /listings/:id:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 7. API-COMPATIBLE SINGLE LISTING
app.get('/api/listings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`📡 GET /api/listings/${id}`);
    
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

// 8. GET LATEST LISTINGS - MAIN ENDPOINT (ALWAYS RETURNS 6 ITEMS)
app.get('/listings/latest/:limit?', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 6;
    console.log(`📡 GET /listings/latest/${limit}`);
    
    let listings = [];
    
    if (isConnected && listingsCollection) {
      // Get from MongoDB
      listings = await listingsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      
      console.log(`📊 Found ${listings.length} listings in MongoDB`);
      
      // Format data
      listings = listings.map(item => ({
        _id: item._id ? item._id.toString() : `mongo-${Date.now()}`,
        id: item.id || item._id?.toString() || 'unknown',
        name: item.name || 'Unnamed Listing',
        category: item.category || 'General',
        price: item.price || 0,
        location: item.location || 'Unknown',
        image: item.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
        description: item.description || 'No description available',
        sellerName: item.sellerName || 'Anonymous',
        email: item.email || 'N/A',
        date: item.date || new Date().toISOString().split('T')[0],
        createdAt: item.createdAt || new Date(),
        updatedAt: item.updatedAt || new Date(),
        source: 'mongodb'
      }));
      
      // If we have less than requested, fill with sample data
      if (listings.length < limit) {
        console.log(`⚠️ Only ${listings.length} in DB, adding sample data`);
        
        const sampleData = [
          {
            _id: 'sample-1',
            id: 101,
            name: 'German Shepherd',
            category: 'Pets',
            price: 0,
            location: 'Khulna',
            image: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800&auto=format&fit=crop&q=80',
            description: '2-year-old German Shepherd for adoption',
            sellerName: 'Dog Shelter',
            email: 'shelter@example.com',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date(),
            source: 'sample'
          },
          {
            _id: 'sample-2',
            id: 102,
            name: 'Cat Tree',
            category: 'Accessories',
            price: 65,
            location: 'Sylhet',
            image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop&q=80',
            description: 'Multi-level cat tree',
            sellerName: 'Cat Furniture',
            email: 'catfurniture@example.com',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date(),
            source: 'sample'
          },
          {
            _id: 'sample-3',
            id: 103,
            name: 'Fish Tank',
            category: 'Accessories',
            price: 85,
            location: 'Dhaka',
            image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80',
            description: '30-gallon fish tank',
            sellerName: 'Aqua World',
            email: 'aqua@example.com',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date(),
            source: 'sample'
          },
          {
            _id: 'sample-4',
            id: 104,
            name: 'Pet Bed',
            category: 'Accessories',
            price: 45,
            location: 'Rajshahi',
            image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&auto=format&fit=crop&q=80',
            description: 'Comfortable pet bed',
            sellerName: 'Pet Comfort',
            email: 'comfort@example.com',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date(),
            source: 'sample'
          },
          {
            _id: 'sample-5',
            id: 105,
            name: 'Bird Cage',
            category: 'Accessories',
            price: 55,
            location: 'Chattogram',
            image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80',
            description: 'Large bird cage',
            sellerName: 'Bird World',
            email: 'bird@example.com',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date(),
            source: 'sample'
          },
          {
            _id: 'sample-6',
            id: 106,
            name: 'Pet Toys Set',
            category: 'Accessories',
            price: 25,
            location: 'Barishal',
            image: 'https://images.unsplash.com/photo-1554456854-55a089fd4cb2?w=800&auto=format&fit=crop&q=80',
            description: 'Set of pet toys',
            sellerName: 'Toy Shop',
            email: 'toys@example.com',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date(),
            updatedAt: new Date(),
            source: 'sample'
          }
        ];
        
        // Add sample data until we reach the limit
        for (const sampleItem of sampleData) {
          if (listings.length >= limit) break;
          listings.push(sampleItem);
        }
      }
      
    } else {
      console.log('⚠️ MongoDB not connected, returning sample data');
      
      // Return full sample data
      listings = [
        {
          _id: 'fallback-1',
          id: 201,
          name: 'Golden Retriever Puppy',
          category: 'Pets',
          price: 0,
          location: 'Dhaka',
          image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800&auto=format&fit=crop&q=80',
          description: 'Friendly puppy for adoption',
          sellerName: 'Pet Care',
          email: 'care@example.com',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback'
        },
        {
          _id: 'fallback-2',
          id: 202,
          name: 'Persian Kitten',
          category: 'Pets',
          price: 150,
          location: 'Chattogram',
          image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&auto=format&fit=crop&q=80',
          description: 'Beautiful kitten',
          sellerName: 'Cat Home',
          email: 'cat@example.com',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback'
        },
        {
          _id: 'fallback-3',
          id: 203,
          name: 'Dog Food',
          category: 'Food',
          price: 20,
          location: 'Sylhet',
          image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=80',
          description: 'Premium dog food',
          sellerName: 'Pet Store',
          email: 'store@example.com',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback'
        },
        {
          _id: 'fallback-4',
          id: 204,
          name: 'Pet Shampoo',
          category: 'Care Products',
          price: 12,
          location: 'Rajshahi',
          image: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=800&auto=format&fit=crop&q=80',
          description: 'Gentle shampoo',
          sellerName: 'Care Mart',
          email: 'care@example.com',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback'
        },
        {
          _id: 'fallback-5',
          id: 205,
          name: 'Dog Leash',
          category: 'Accessories',
          price: 15,
          location: 'Dhaka',
          image: 'https://images.unsplash.com/photo-1554456854-55a089fd4cb2?w=800&auto=format&fit=crop&q=80',
          description: 'Premium leash',
          sellerName: 'Pet Gear',
          email: 'gear@example.com',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback'
        },
        {
          _id: 'fallback-6',
          id: 206,
          name: 'Rabbit Hutch',
          category: 'Accessories',
          price: 110,
          location: 'Barishal',
          image: 'https://images.unsplash.com/photo-1504595403659-9088ce801e29?w=800&auto=format&fit=crop&q=80',
          description: 'Spacious hutch',
          sellerName: 'Pet World',
          email: 'world@example.com',
          date: new Date().toISOString().split('T')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'fallback'
        }
      ];
    }
    
    // Return exactly the requested limit
    const finalListings = listings.slice(0, limit);
    console.log(`📦 Sending ${finalListings.length} listings`);
    
    res.json(finalListings);
    
  } catch (error) {
    console.error('❌ Error in /listings/latest:', error);
    
    // Error fallback
    const errorListings = Array.from({ length: 6 }, (_, i) => ({
      _id: `error-${i+1}`,
      id: 300 + i,
      name: `Pet Item ${i+1}`,
      category: i % 2 === 0 ? 'Pets' : 'Accessories',
      price: i * 25,
      location: 'Dhaka',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
      description: 'Sample description',
      sellerName: 'Sample Seller',
      email: 'sample@example.com',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'error'
    })).slice(0, parseInt(req.params.limit) || 6);
    
    res.json(errorListings);
  }
});

// 9. API-COMPATIBLE LATEST LISTINGS
app.get('/api/listings/latest/:limit?', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 6;
    console.log(`📡 GET /api/listings/latest/${limit}`);
    
    // Use the same logic as /listings/latest
    req.url = `/listings/latest/${limit}`;
    return app._router.handle(req, res);
    
  } catch (error) {
    console.error('❌ Error in /api/listings/latest:', error);
    
    const errorListings = Array.from({ length: 6 }, (_, i) => ({
      _id: `api-error-${i+1}`,
      id: 400 + i,
      name: `API Pet ${i+1}`,
      category: ['Pets', 'Food', 'Accessories', 'Care Products'][i % 4],
      price: i * 20,
      location: 'Unknown',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
      description: 'API sample description',
      sellerName: 'API Seller',
      email: 'api@example.com',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'api-error'
    })).slice(0, parseInt(req.params.limit) || 6);
    
    res.json(errorListings);
  }
});

// 10. GET RECENT LISTINGS
app.get('/listings/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    console.log(`📡 GET /listings/recent?limit=${limit}`);
    
    // Use the same logic as /listings/latest
    req.url = `/listings/latest/${limit}`;
    return app._router.handle(req, res);
    
  } catch (error) {
    console.error('❌ Error in /listings/recent:', error);
    
    const errorListings = Array.from({ length: 6 }, (_, i) => ({
      _id: `recent-error-${i+1}`,
      id: 500 + i,
      name: `Recent Pet ${i+1}`,
      category: ['Pets', 'Food', 'Accessories'][i % 3],
      price: i * 30,
      location: 'Various',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
      description: 'Recent sample',
      sellerName: 'Recent Seller',
      email: 'recent@example.com',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'recent-error'
    })).slice(0, parseInt(req.query.limit) || 6);
    
    res.json({
      success: false,
      message: 'Failed to fetch recent listings',
      listings: errorListings
    });
  }
});

// 11. API-COMPATIBLE RECENT LISTINGS
app.get('/api/listings/recent', async (req, res) => {
  try {
    console.log('📡 GET /api/listings/recent');
    
    req.url = '/listings/recent';
    return app._router.handle(req, res);
    
  } catch (error) {
    console.error('❌ Error in /api/listings/recent:', error);
    res.json({
      success: false,
      message: 'Failed to fetch recent listings',
      listings: []
    });
  }
});

// 12. GET LISTINGS BY CATEGORY
app.get('/listings/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    console.log(`📡 GET /listings/category/${category}`);
    
    let listings = [];
    
    if (isConnected && listingsCollection) {
      listings = await listingsCollection
        .find({ category: { $regex: new RegExp(category, 'i') } })
        .sort({ createdAt: -1 })
        .toArray();
      
      listings = listings.map(item => ({
        ...item,
        _id: item._id ? item._id.toString() : `cat-${Date.now()}`
      }));
      
      console.log(`📊 Found ${listings.length} items in category: ${category}`);
    }
    
    res.json(listings);
    
  } catch (error) {
    console.error(`❌ Error in /listings/category/:`, error);
    res.json([]);
  }
});

// 13. API-COMPATIBLE CATEGORY ENDPOINT
app.get('/api/listings/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    console.log(`📡 GET /api/listings/category/${category}`);
    
    req.url = `/listings/category/${category}`;
    return app._router.handle(req, res);
    
  } catch (error) {
    console.error(`❌ Error in /api/listings/category/:`, error);
    res.json([]);
  }
});

// 14. CREATE NEW LISTING
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
    
    const latestListing = isConnected && listingsCollection ? 
      await listingsCollection.find().sort({ id: -1 }).limit(1).toArray() : [];
    const newId = latestListing.length > 0 ? latestListing[0].id + 1 : 1000;
    
    const newListing = {
      id: newId,
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
      newListing._id = `new-${Date.now()}`;
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

// 15. CREATE NEW ORDER
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

// 16. GET USER ORDERS BY EMAIL
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
    }
    
    res.json(orders);
    
  } catch (error) {
    console.error('Error in /orders/user/:email:', error);
    res.json([]);
  }
});

// 17. API-COMPATIBLE ORDER ROUTE
app.get('/api/orders/user/:email', async (req, res) => {
  try {
    const email = req.params.email;
    console.log(`📡 GET /api/orders/user/${email}`);
    
    req.url = `/orders/user/${email}`;
    return app._router.handle(req, res);
    
  } catch (error) {
    console.error('❌ Error in /api/orders/user/:email:', error);
    res.json([]);
  }
});

// 18. SEED DATABASE
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
        message: '⚠️ MongoDB not connected, cannot seed database'
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

// 19. DATABASE STATUS
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

// 20. ADD TEST DATA
app.post('/add-test', async (req, res) => {
  try {
    const latestListing = isConnected && listingsCollection ? 
      await listingsCollection.find().sort({ id: -1 }).limit(1).toArray() : [];
    const newId = latestListing.length > 0 ? latestListing[0].id + 1 : 1000;
    
    const testData = {
      id: newId,
      name: 'Test Pet - ' + new Date().toLocaleTimeString(),
      category: 'Pets',
      price: Math.floor(Math.random() * 200),
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

// 21. PING TEST
app.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'pong 🏓',
    server: 'PawMart Backend',
    timestamp: new Date().toISOString()
  });
});

// ========== ERROR HANDLING ==========
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

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
📈 Latest Listings: https://backend-10-five.vercel.app/listings/latest/6
📈 API Latest: https://backend-10-five.vercel.app/api/listings/latest/6
📈 Recent: https://backend-10-five.vercel.app/listings/recent?limit=6
🐾 Categories: https://backend-10-five.vercel.app/listings/category/:category
🌱 Seed: https://backend-10-five.vercel.app/seed (POST)
➕ Add Test: https://backend-10-five.vercel.app/add-test (POST)
📊 DB Status: https://backend-10-five.vercel.app/db-status
  `);
});

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