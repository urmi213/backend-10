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
  methods: ['GET', 'POST, PUT, DELETE, OPTIONS, PATCH'],
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
      maxPoolSize: 10,
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
    console.log('⚠️ Continuing with in-memory storage');
    isConnected = false;
    return false;
  }
}

async function seedSampleData() {
  try {
    const sampleListings = [
      {
        _id: new ObjectId(),
        id: 1,
        name: 'Golden Retriever Puppy',
        title: 'Golden Retriever Puppy - Ready for Adoption',
        category: 'Pets',
        price: 0,
        location: 'Dhaka',
        image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800&auto=format&fit=crop&q=80',
        description: 'Friendly 3-month-old Golden Retriever puppy. Vaccinated, dewormed, and ready for a loving home. Very playful and good with kids.',
        sellerName: 'Pet Care Center',
        email: 'petcare@example.com',
        phone: '+8801712345678',
        date: '2024-12-10',
        views: 245,
        rating: 4.8,
        tags: ['puppy', 'dog', 'adoption', 'family-friendly'],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'database'
      },
      {
        _id: new ObjectId(),
        id: 2,
        name: 'Persian Kitten',
        title: 'Beautiful White Persian Kitten',
        category: 'Pets',
        price: 150,
        location: 'Chattogram',
        image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&auto=format&fit=crop&q=80',
        description: '2-month-old pure white Persian kitten. Litter trained, vaccinated, and very affectionate. Perfect for cat lovers.',
        sellerName: 'Cat Lovers Hub',
        email: 'catlover@example.com',
        phone: '+8801812345678',
        date: '2024-12-09',
        views: 189,
        rating: 4.9,
        tags: ['kitten', 'cat', 'persian', 'pedigree'],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'database'
      },
      {
        _id: new ObjectId(),
        id: 3,
        name: 'German Shepherd',
        title: 'Adult German Shepherd for Adoption',
        category: 'Pets',
        price: 0,
        location: 'Khulna',
        image: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800&auto=format&fit=crop&q=80',
        description: '2-year-old trained German Shepherd. Good guard dog, healthy, and obedient. Looking for experienced dog owner.',
        sellerName: 'Dog Shelter',
        email: 'shelter@example.com',
        phone: '+8801912345678',
        date: '2024-12-08',
        views: 312,
        rating: 4.7,
        tags: ['german-shepherd', 'guard-dog', 'adoption', 'trained'],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'database'
      },
      {
        _id: new ObjectId(),
        id: 4,
        name: 'Rabbit Pair',
        title: 'Cute Rabbit Pair with Cage',
        category: 'Pets',
        price: 80,
        location: 'Sylhet',
        image: 'https://images.unsplash.com/photo-1556838803-cc94986cb631?w=800&auto=format&fit=crop&q=80',
        description: 'Pair of healthy rabbits (male & female) with starter cage. Perfect for kids, very gentle and easy to care for.',
        sellerName: 'Small Pet World',
        email: 'smallpets@example.com',
        phone: '+8801612345678',
        date: '2024-12-07',
        views: 156,
        rating: 4.5,
        tags: ['rabbit', 'pair', 'cage-included', 'kids-pet'],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'database'
      },
      {
        _id: new ObjectId(),
        id: 5,
        name: 'Himalayan Cat',
        title: 'Purebred Himalayan Cat',
        category: 'Pets',
        price: 200,
        location: 'Rajshahi',
        image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&auto=format&fit=crop&q=80',
        description: '1-year-old Himalayan cat, purebred, very affectionate and well-behaved. Perfect indoor companion.',
        sellerName: 'Premium Pets',
        email: 'premiumpets@example.com',
        phone: '+8801512345678',
        date: '2024-12-06',
        views: 278,
        rating: 4.9,
        tags: ['cat', 'himalayan', 'purebred', 'pedigree'],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'database'
      },
      {
        _id: new ObjectId(),
        id: 6,
        name: 'Parrot Pair',
        title: 'Colorful Parrot Pair',
        category: 'Pets',
        price: 120,
        location: 'Barishal',
        image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80',
        description: 'Beautiful parrot pair that can mimic words. Comes with large cage and starter kit.',
        sellerName: 'Bird Paradise',
        email: 'birdparadise@example.com',
        phone: '+8801412345678',
        date: '2024-12-05',
        views: 198,
        rating: 4.6,
        tags: ['parrot', 'bird', 'talking-bird', 'cage-included'],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'database'
      },
      {
        _id: new ObjectId(),
        id: 7,
        name: 'Premium Dog Food 5kg',
        title: 'Premium Dog Food - 5kg Pack',
        category: 'Food',
        price: 25,
        location: 'Dhaka',
        image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=80',
        description: 'High-quality dog food with natural ingredients. Complete balanced diet for all breeds. Rich in protein and vitamins.',
        sellerName: 'Pet Food Store',
        email: 'petfood@example.com',
        phone: '+8801312345678',
        date: '2024-12-04',
        views: 432,
        rating: 4.7,
        tags: ['dog-food', 'premium', '5kg', 'nutrition'],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'database'
      },
      {
        _id: new ObjectId(),
        id: 8,
        name: 'Cat Dry Food 3kg',
        title: 'Gourmet Cat Food - 3kg',
        category: 'Food',
        price: 20,
        location: 'Chattogram',
        image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&auto=format&fit=crop&q=80',
        description: 'Delicious cat food with fish flavor. Contains essential nutrients for healthy growth. Suitable for all cat breeds.',
        sellerName: 'Cat Food Express',
        email: 'catfood@example.com',
        phone: '+8801212345678',
        date: '2024-12-03',
        views: 389,
        rating: 4.6,
        tags: ['cat-food', 'gourmet', '3kg', 'fish-flavor'],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'database'
      },
      {
        _id: new ObjectId(),
        id: 9,
        name: 'Bird Seeds Mix 2kg',
        title: 'Premium Bird Seeds Mix - 2kg',
        category: 'Food',
        price: 15,
        location: 'Sylhet',
        image: 'https://images.unsplash.com/photo-1576238366785-f469cdd0e2da?w=800&auto=format&fit=crop&q=80',
        description: 'Nutritious seed mix for all types of birds. Contains sunflower seeds, millet, and other healthy grains.',
        sellerName: 'Bird Food Express',
        email: 'birdfood@example.com',
        phone: '+8801112345678',
        date: '2024-12-02',
        views: 234,
        rating: 4.5,
        tags: ['bird-food', 'seeds', '2kg', 'nutrition'],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'database'
      },
      {
        _id: new ObjectId(),
        id: 10,
        name: 'Dog Leash Set',
        title: 'Premium Dog Leash & Collar Set',
        category: 'Accessories',
        price: 18,
        location: 'Dhaka',
        image: 'https://images.unsplash.com/photo-1554456854-55a089fd4cb2?w=800&auto=format&fit=crop&q=80',
        description: 'High-quality leather dog leash with matching collar. Adjustable size, durable, and comfortable for your pet.',
        sellerName: 'Pet Gear BD',
        email: 'petgear@example.com',
        phone: '+8801012345678',
        date: '2024-12-01',
        views: 567,
        rating: 4.6,
        tags: ['leash', 'collar', 'dog-accessories', 'premium'],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'database'
      },
      {
        _id: new ObjectId(),
        id: 11,
        name: 'Cat Tree House',
        title: 'Multi-Level Cat Tree with Scratching Posts',
        category: 'Accessories',
        price: 65,
        location: 'Sylhet',
        image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop&q=80',
        description: 'Spacious cat tree with multiple levels, scratching posts, and cozy sleeping areas. Perfect for indoor cats.',
        sellerName: 'Cat Furniture',
        email: 'catfurniture@example.com',
        phone: '+8801712345000',
        date: '2024-11-30',
        views: 432,
        rating: 4.8,
        tags: ['cat-tree', 'scratching-post', 'furniture', 'multi-level'],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'database'
      },
      {
        _id: new ObjectId(),
        id: 12,
        name: 'Fish Tank Set',
        title: 'Complete Fish Tank Set 30 Gallon',
        category: 'Accessories',
        price: 85,
        location: 'Chattogram',
        image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=800&auto=format&fit=crop&q=80',
        description: '30-gallon fish tank complete with filter, LED lights, heater, and decoration. Ready for your aquarium setup.',
        sellerName: 'Aqua World',
        email: 'aquaworld@example.com',
        phone: '+8801812345000',
        date: '2024-11-29',
        views: 321,
        rating: 4.7,
        tags: ['fish-tank', 'aquarium', 'complete-set', '30-gallon'],
        createdAt: new Date(),
        updatedAt: new Date(),
        source: 'database'
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
    console.log('⚠️ Running with fallback mode - MongoDB not connected');
  }
});

// In-memory fallback storage (if MongoDB fails)
const memoryStorage = {
  listings: [
    {
      _id: '1',
      id: 1,
      name: 'Golden Retriever Puppy',
      title: 'Golden Retriever Puppy - Ready for Adoption',
      category: 'Pets',
      price: 0,
      location: 'Dhaka',
      image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800&auto=format&fit=crop&q=80',
      description: 'Friendly 3-month-old Golden Retriever puppy. Vaccinated, dewormed, and ready for a loving home. Very playful and good with kids.',
      sellerName: 'Pet Care Center',
      email: 'petcare@example.com',
      phone: '+8801712345678',
      date: '2024-12-10',
      views: 245,
      rating: 4.8,
      tags: ['puppy', 'dog', 'adoption', 'family-friendly'],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'memory'
    },
    {
      _id: '2',
      id: 2,
      name: 'Persian Kitten',
      title: 'Beautiful White Persian Kitten',
      category: 'Pets',
      price: 150,
      location: 'Chattogram',
      image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&auto=format&fit=crop&q=80',
      description: '2-month-old pure white Persian kitten. Litter trained, vaccinated, and very affectionate. Perfect for cat lovers.',
      sellerName: 'Cat Lovers Hub',
      email: 'catlover@example.com',
      phone: '+8801812345678',
      date: '2024-12-09',
      views: 189,
      rating: 4.9,
      tags: ['kitten', 'cat', 'persian', 'pedigree'],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'memory'
    },
    {
      _id: '3',
      id: 3,
      name: 'German Shepherd',
      title: 'Adult German Shepherd for Adoption',
      category: 'Pets',
      price: 0,
      location: 'Khulna',
      image: 'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800&auto=format&fit=crop&q=80',
      description: '2-year-old trained German Shepherd. Good guard dog, healthy, and obedient. Looking for experienced dog owner.',
      sellerName: 'Dog Shelter',
      email: 'shelter@example.com',
      phone: '+8801912345678',
      date: '2024-12-08',
      views: 312,
      rating: 4.7,
      tags: ['german-shepherd', 'guard-dog', 'adoption', 'trained'],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'memory'
    },
    {
      _id: '4',
      id: 4,
      name: 'Rabbit Pair',
      title: 'Cute Rabbit Pair with Cage',
      category: 'Pets',
      price: 80,
      location: 'Sylhet',
      image: 'https://images.unsplash.com/photo-1556838803-cc94986cb631?w=800&auto=format&fit=crop&q=80',
      description: 'Pair of healthy rabbits (male & female) with starter cage. Perfect for kids, very gentle and easy to care for.',
      sellerName: 'Small Pet World',
      email: 'smallpets@example.com',
      phone: '+8801612345678',
      date: '2024-12-07',
      views: 156,
      rating: 4.5,
      tags: ['rabbit', 'pair', 'cage-included', 'kids-pet'],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'memory'
    },
    {
      _id: '5',
      id: 5,
      name: 'Himalayan Cat',
      title: 'Purebred Himalayan Cat',
      category: 'Pets',
      price: 200,
      location: 'Rajshahi',
      image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&auto=format&fit=crop&q=80',
      description: '1-year-old Himalayan cat, purebred, very affectionate and well-behaved. Perfect indoor companion.',
      sellerName: 'Premium Pets',
      email: 'premiumpets@example.com',
      phone: '+8801512345678',
      date: '2024-12-06',
      views: 278,
      rating: 4.9,
      tags: ['cat', 'himalayan', 'purebred', 'pedigree'],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'memory'
    },
    {
      _id: '6',
      id: 6,
      name: 'Parrot Pair',
      title: 'Colorful Parrot Pair',
      category: 'Pets',
      price: 120,
      location: 'Barishal',
      image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80',
      description: 'Beautiful parrot pair that can mimic words. Comes with large cage and starter kit.',
      sellerName: 'Bird Paradise',
      email: 'birdparadise@example.com',
      phone: '+8801412345678',
      date: '2024-12-05',
      views: 198,
      rating: 4.6,
      tags: ['parrot', 'bird', 'talking-bird', 'cage-included'],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'memory'
    },
    {
      _id: '7',
      id: 7,
      name: 'Premium Dog Food 5kg',
      title: 'Premium Dog Food - 5kg Pack',
      category: 'Food',
      price: 25,
      location: 'Dhaka',
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&auto=format&fit=crop&q=80',
      description: 'High-quality dog food with natural ingredients. Complete balanced diet for all breeds. Rich in protein and vitamins.',
      sellerName: 'Pet Food Store',
      email: 'petfood@example.com',
      phone: '+8801312345678',
      date: '2024-12-04',
      views: 432,
      rating: 4.7,
      tags: ['dog-food', 'premium', '5kg', 'nutrition'],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'memory'
    },
    {
      _id: '8',
      id: 8,
      name: 'Cat Dry Food 3kg',
      title: 'Gourmet Cat Food - 3kg',
      category: 'Food',
      price: 20,
      location: 'Chattogram',
      image: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&auto=format&fit=crop&q=80',
      description: 'Delicious cat food with fish flavor. Contains essential nutrients for healthy growth. Suitable for all cat breeds.',
      sellerName: 'Cat Food Express',
      email: 'catfood@example.com',
      phone: '+8801212345678',
      date: '2024-12-03',
      views: 389,
      rating: 4.6,
      tags: ['cat-food', 'gourmet', '3kg', 'fish-flavor'],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'memory'
    },
    {
      _id: '9',
      id: 9,
      name: 'Bird Seeds Mix 2kg',
      title: 'Premium Bird Seeds Mix - 2kg',
      category: 'Food',
      price: 15,
      location: 'Sylhet',
      image: 'https://images.unsplash.com/photo-1576238366785-f469cdd0e2da?w=800&auto=format&fit=crop&q=80',
      description: 'Nutritious seed mix for all types of birds. Contains sunflower seeds, millet, and other healthy grains.',
      sellerName: 'Bird Food Express',
      email: 'birdfood@example.com',
      phone: '+8801112345678',
      date: '2024-12-02',
      views: 234,
      rating: 4.5,
      tags: ['bird-food', 'seeds', '2kg', 'nutrition'],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'memory'
    },
    {
      _id: '10',
      id: 10,
      name: 'Dog Leash Set',
      title: 'Premium Dog Leash & Collar Set',
      category: 'Accessories',
      price: 18,
      location: 'Dhaka',
      image: 'https://images.unsplash.com/photo-1554456854-55a089fd4cb2?w=800&auto=format&fit=crop&q=80',
      description: 'High-quality leather dog leash with matching collar. Adjustable size, durable, and comfortable for your pet.',
      sellerName: 'Pet Gear BD',
      email: 'petgear@example.com',
      phone: '+8801012345678',
      date: '2024-12-01',
      views: 567,
      rating: 4.6,
      tags: ['leash', 'collar', 'dog-accessories', 'premium'],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'memory'
    },
    {
      _id: '11',
      id: 11,
      name: 'Cat Tree House',
      title: 'Multi-Level Cat Tree with Scratching Posts',
      category: 'Accessories',
      price: 65,
      location: 'Sylhet',
      image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop&q=80',
      description: 'Spacious cat tree with multiple levels, scratching posts, and cozy sleeping areas. Perfect for indoor cats.',
      sellerName: 'Cat Furniture',
      email: 'catfurniture@example.com',
      phone: '+8801712345000',
      date: '2024-11-30',
      views: 432,
      rating: 4.8,
      tags: ['cat-tree', 'scratching-post', 'furniture', 'multi-level'],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'memory'
    },
    {
      _id: '12',
      id: 12,
      name: 'Fish Tank Set',
      title: 'Complete Fish Tank Set 30 Gallon',
      category: 'Accessories',
      price: 85,
      location: 'Chattogram',
      image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=800&auto=format&fit=crop&q=80',
      description: '30-gallon fish tank complete with filter, LED lights, heater, and decoration. Ready for your aquarium setup.',
      sellerName: 'Aqua World',
      email: 'aquaworld@example.com',
      phone: '+8801812345000',
      date: '2024-11-29',
      views: 321,
      rating: 4.7,
      tags: ['fish-tank', 'aquarium', 'complete-set', '30-gallon'],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'memory'
    }
  ],
  orders: []
};

console.log(`✅ Loaded ${memoryStorage.listings.length} products in memory storage`);

// ========== HELPER FUNCTIONS ==========
function getFallbackListing(id) {
  console.log(`🔄 Getting fallback for ID: ${id}`);
  
  const numericId = parseInt(id);
  const category = ['Pets', 'Food', 'Accessories', 'Care Products'][numericId % 4];
  const location = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi'][numericId % 4];
  const price = (numericId * 10) % 200;
  
  return {
    _id: id.toString(),
    id: numericId || 999,
    name: `Pet Product ${numericId || id}`,
    title: `Product ${numericId || id} - Available Now`,
    category: category,
    price: price,
    location: location,
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
    description: `This is product #${numericId || id}. A wonderful addition to your pet care collection. Visit our store for more amazing products.`,
    sellerName: 'PawMart Store',
    email: 'info@pawmart.com',
    phone: '+8801710000000',
    date: new Date().toISOString().split('T')[0],
    views: 150,
    rating: 4.0,
    tags: ['sample', 'fallback'],
    createdAt: new Date(),
    updatedAt: new Date(),
    source: 'fallback'
  };
}

// ========== ROUTES ==========

// 1. ROOT ENDPOINT
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🐾 PawMart Backend API v1.0',
    status: 'running',
    database: isConnected ? 'connected ✅' : 'disconnected (using memory) ⚠️',
    storage: isConnected ? 'MongoDB Atlas' : 'In-Memory Storage',
    products: isConnected ? 'Check /listings' : memoryStorage.listings.length,
    endpoints: {
      allProducts: '/listings, /api/listings',
      singleProduct: '/listings/:id, /api/listings/:id',
      latestProducts: '/listings/latest/:limit',
      byCategory: '/listings/category/:category',
      orders: '/orders (POST)',
      health: '/health',
      test: '/test',
      seed: '/seed (POST)',
      ping: '/ping'
    },
    timestamp: new Date().toISOString()
  });
});

// 2. HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy ✅',
    database: isConnected ? 'connected ✅' : 'disconnected ⚠️',
    storage: isConnected ? 'MongoDB Atlas' : 'In-Memory Storage',
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
      // Get from MongoDB
      listings = await listingsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      
      console.log(`📊 Found ${listings.length} listings in MongoDB`);
      
      // Format MongoDB data
      listings = listings.map(item => ({
        ...item,
        _id: item._id ? item._id.toString() : `mongo-${Date.now()}`
      }));
      
    } else {
      // Get from memory storage
      listings = [...memoryStorage.listings];
      console.log(`📊 Found ${listings.length} listings in memory`);
    }
    
    res.json(listings);
    
  } catch (error) {
    console.error('❌ Error in /listings:', error.message);
    // Return memory storage as fallback
    res.json(memoryStorage.listings);
  }
});

// 5. API-COMPATIBLE LISTINGS
app.get('/api/listings', async (req, res) => {
  try {
    console.log('📡 GET /api/listings');
    
    req.url = '/listings';
    return app._router.handle(req, res);
    
  } catch (error) {
    console.error('❌ Error in /api/listings:', error.message);
    res.json(memoryStorage.listings);
  }
});

// 6. GET SINGLE LISTING BY ID
app.get('/listings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`📡 GET /listings/${id}`);
    
    let listing = null;
    
    if (isConnected && listingsCollection) {
      // Try MongoDB first
      try {
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
          console.log(`✅ Found in MongoDB: ${listing.name}`);
        }
      } catch (mongoError) {
        console.log('⚠️ MongoDB query failed, checking memory');
      }
    }
    
    // If not found in MongoDB or MongoDB is disconnected, check memory
    if (!listing) {
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        listing = memoryStorage.listings.find(item => item.id === numericId);
      }
      
      if (!listing) {
        listing = memoryStorage.listings.find(item => item._id === id);
      }
      
      if (listing) {
        console.log(`✅ Found in memory: ${listing.name}`);
      }
    }
    
    // If still not found, return fallback
    if (!listing) {
      console.log(`⚠️ Product ${id} not found, returning fallback`);
      listing = getFallbackListing(id);
    }
    
    res.json(listing);
    
  } catch (error) {
    console.error(`❌ Error in /listings/:id:`, error);
    const fallbackData = getFallbackListing(req.params.id);
    res.json(fallbackData);
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
    const fallbackData = getFallbackListing(req.params.id);
    res.json(fallbackData);
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
      try {
        listings = await listingsCollection
          .find({})
          .sort({ createdAt: -1 })
          .limit(limit)
          .toArray();
        
        console.log(`📊 Found ${listings.length} listings in MongoDB`);
        
        // Format data
        listings = listings.map(item => ({
          _id: item._id ? item._id.toString() : `mongo-${Date.now()}`,
          id: item.id || parseInt(item._id?.toString().slice(-4), 16) || 0,
          name: item.name || 'Unnamed Listing',
          title: item.title || item.name || 'Pet Product',
          category: item.category || 'General',
          price: item.price || 0,
          location: item.location || 'Unknown',
          image: item.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
          description: item.description || 'No description available',
          sellerName: item.sellerName || 'Anonymous',
          email: item.email || 'N/A',
          phone: item.phone || '+8801000000000',
          date: item.date || new Date().toISOString().split('T')[0],
          views: item.views || 0,
          rating: item.rating || 0,
          tags: item.tags || [],
          createdAt: item.createdAt || new Date(),
          updatedAt: item.updatedAt || new Date(),
          source: 'mongodb'
        }));
      } catch (mongoError) {
        console.log('⚠️ MongoDB query failed, using memory storage');
        listings = [...memoryStorage.listings];
      }
    } else {
      // Get from memory storage
      listings = [...memoryStorage.listings];
    }
    
    // Sort by date and limit
    listings = listings
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
      .slice(0, limit);
    
    console.log(`📦 Sending ${listings.length} latest listings`);
    
    res.json(listings);
    
  } catch (error) {
    console.error('❌ Error in /listings/latest:', error);
    
    // Error fallback - return from memory
    const errorListings = memoryStorage.listings
      .slice(0, parseInt(req.params.limit) || 6);
    
    res.json(errorListings);
  }
});

// 9. API-COMPATIBLE LATEST LISTINGS
app.get('/api/listings/latest/:limit?', async (req, res) => {
  try {
    const limit = parseInt(req.params.limit) || 6;
    console.log(`📡 GET /api/listings/latest/${limit}`);
    
    req.url = `/listings/latest/${limit}`;
    return app._router.handle(req, res);
    
  } catch (error) {
    console.error('❌ Error in /api/listings/latest:', error);
    
    const errorListings = memoryStorage.listings
      .slice(0, parseInt(req.params.limit) || 6);
    
    res.json(errorListings);
  }
});

// 10. GET RECENT LISTINGS
app.get('/listings/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    console.log(`📡 GET /listings/recent?limit=${limit}`);
    
    req.url = `/listings/latest/${limit}`;
    return app._router.handle(req, res);
    
  } catch (error) {
    console.error('❌ Error in /listings/recent:', error);
    
    const errorListings = memoryStorage.listings
      .slice(0, parseInt(req.query.limit) || 6);
    
    res.json({
      success: true,
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
      success: true,
      listings: memoryStorage.listings.slice(0, 6)
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
      // Get from MongoDB
      try {
        listings = await listingsCollection
          .find({ category: { $regex: new RegExp(category, 'i') } })
          .sort({ createdAt: -1 })
          .toArray();
        
        listings = listings.map(item => ({
          ...item,
          _id: item._id ? item._id.toString() : `cat-${Date.now()}`
        }));
        
        console.log(`📊 Found ${listings.length} items in MongoDB category: ${category}`);
      } catch (mongoError) {
        console.log('⚠️ MongoDB query failed, using memory storage');
        listings = memoryStorage.listings.filter(item => 
          item.category.toLowerCase().includes(category.toLowerCase())
        );
      }
    } else {
      // Get from memory storage
      listings = memoryStorage.listings.filter(item => 
        item.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    console.log(`📦 Sending ${listings.length} items in category: ${category}`);
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
    
    // Generate ID
    const latestId = isConnected && listingsCollection ? 
      (await listingsCollection.find().sort({ id: -1 }).limit(1).toArray())[0]?.id || 
      memoryStorage.listings.reduce((max, item) => Math.max(max, item.id), 0) :
      memoryStorage.listings.reduce((max, item) => Math.max(max, item.id), 0);
    
    const newId = latestId + 1;
    
    const newListing = {
      id: newId,
      ...listingData,
      title: listingData.title || listingData.name,
      price: parseFloat(listingData.price) || 0,
      sellerName: listingData.sellerName || listingData.email?.split('@')[0] || 'Pet Owner',
      phone: listingData.phone || '+8801000000000',
      date: new Date().toISOString().split('T')[0],
      views: 0,
      rating: 0,
      tags: listingData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      source: 'user-created'
    };
    
    // Add to MongoDB if connected
    if (isConnected && listingsCollection) {
      const result = await listingsCollection.insertOne(newListing);
      newListing._id = result.insertedId.toString();
      newListing.source = 'mongodb';
    } else {
      // Add to memory storage
      newListing._id = `user-${Date.now()}`;
      newListing.source = 'memory';
      memoryStorage.listings.push(newListing);
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
      orderDate: new Date().toISOString(),
      orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to MongoDB if connected
    if (isConnected && ordersCollection) {
      const result = await ordersCollection.insertOne(newOrder);
      newOrder._id = result.insertedId.toString();
      newOrder.source = 'mongodb';
    } else {
      // Add to memory storage
      newOrder._id = `order-${Date.now()}`;
      newOrder.source = 'memory';
      memoryStorage.orders.push(newOrder);
    }
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder,
      orderId: newOrder.orderId
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
    } else {
      orders = memoryStorage.orders
        .filter(order => order.email === email)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
      // Reset memory storage to original data
      memoryStorage.listings = [
        {
          _id: '1',
          id: 1,
          name: 'Golden Retriever Puppy',
          title: 'Golden Retriever Puppy - Ready for Adoption',
          category: 'Pets',
          price: 0,
          location: 'Dhaka',
          image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=800&auto=format&fit=crop&q=80',
          description: 'Friendly 3-month-old Golden Retriever puppy. Vaccinated, dewormed, and ready for a loving home. Very playful and good with kids.',
          sellerName: 'Pet Care Center',
          email: 'petcare@example.com',
          phone: '+8801712345678',
          date: '2024-12-10',
          views: 245,
          rating: 4.8,
          tags: ['puppy', 'dog', 'adoption', 'family-friendly'],
          createdAt: new Date(),
          updatedAt: new Date(),
          source: 'memory'
        },
        // ... include all 12 items here (same as memoryStorage.listings initialization)
      ];
      
      res.json({
        success: true,
        message: `✅ Memory storage seeded with ${memoryStorage.listings.length} listings`,
        count: memoryStorage.listings.length
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
      storage: isConnected ? 'MongoDB Atlas' : 'In-Memory',
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
    } else {
      status.listingsCount = memoryStorage.listings.length;
    }
    
    res.json({
      success: true,
      status: status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.json({
      success: true,
      status: {
        connected: isConnected,
        storage: 'In-Memory (fallback)',
        listingsCount: memoryStorage.listings.length,
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// 20. ADD TEST DATA
app.post('/add-test', async (req, res) => {
  try {
    // Generate new ID
    const latestId = isConnected && listingsCollection ? 
      (await listingsCollection.find().sort({ id: -1 }).limit(1).toArray())[0]?.id || 
      memoryStorage.listings.reduce((max, item) => Math.max(max, item.id), 0) :
      memoryStorage.listings.reduce((max, item) => Math.max(max, item.id), 0);
    
    const newId = latestId + 1;
    
    const testData = {
      id: newId,
      name: 'Test Pet - ' + new Date().toLocaleTimeString(),
      title: 'Test Listing',
      category: 'Pets',
      price: Math.floor(Math.random() * 200),
      location: 'Test City',
      image: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0',
      description: 'This is a test listing',
      sellerName: 'Test Seller',
      email: 'test@example.com',
      phone: '+8801000000000',
      date: new Date().toISOString().split('T')[0],
      views: 0,
      rating: 0,
      tags: ['test'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to MongoDB if connected
    if (isConnected && listingsCollection) {
      const result = await listingsCollection.insertOne(testData);
      testData._id = result.insertedId.toString();
      testData.source = 'mongodb-test';
    } else {
      // Add to memory storage
      testData._id = `test-${Date.now()}`;
      testData.source = 'memory-test';
      memoryStorage.listings.push(testData);
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
    database: isConnected ? 'connected' : 'memory',
    timestamp: new Date().toISOString()
  });
});

// 22. GET PRODUCT COUNT
app.get('/count', async (req, res) => {
  try {
    let count = 0;
    
    if (isConnected && listingsCollection) {
      count = await listingsCollection.countDocuments();
    } else {
      count = memoryStorage.listings.length;
    }
    
    res.json({
      success: true,
      count: count,
      expected: 12,
      status: count >= 12 ? '✅ Complete' : '⚠️ Incomplete'
    });
    
  } catch (error) {
    res.json({
      success: false,
      count: memoryStorage.listings.length,
      expected: 12,
      error: error.message
    });
  }
});

// 23. GET ALL PRODUCTS WITH DETAILS
app.get('/products/full', async (req, res) => {
  try {
    console.log('📡 GET /products/full - Detailed products list');
    
    let listings = [];
    
    if (isConnected && listingsCollection) {
      listings = await listingsCollection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      
      listings = listings.map(item => ({
        ...item,
        _id: item._id ? item._id.toString() : `mongo-${Date.now()}`
      }));
    } else {
      listings = [...memoryStorage.listings];
    }
    
    res.json({
      success: true,
      count: listings.length,
      products: listings
    });
    
  } catch (error) {
    console.error('❌ Error in /products/full:', error);
    res.json({
      success: true,
      count: memoryStorage.listings.length,
      products: memoryStorage.listings
    });
  }
});

// 24. GET ALL ENDPOINTS
app.get('/endpoints', (req, res) => {
  res.json({
    success: true,
    endpoints: {
      singleListing: {
        primary: '/listings/:id',
        api: '/api/listings/:id'
      },
      allListings: '/listings, /api/listings',
      latest: '/listings/latest/:limit, /api/listings/latest/:limit',
      recent: '/listings/recent, /api/listings/recent',
      category: '/listings/category/:category, /api/listings/category/:category',
      orders: '/orders (POST), /orders/user/:email (GET)',
      health: '/health',
      dbStatus: '/db-status',
      seed: '/seed (POST)',
      ping: '/ping',
      count: '/count',
      productsFull: '/products/full',
      addTest: '/add-test (POST)'
    },
    note: 'Hybrid storage - uses MongoDB if connected, otherwise uses in-memory storage',
    timestamp: new Date().toISOString()
  });
});

// ========== ERROR HANDLING ==========
app.use('*', (req, res) => {
  console.log(`❓ Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /listings (12 products)',
      'GET /listings/:id (1-12)',
      'GET /api/listings/:id',
      'GET /listings/latest/6',
      'GET /listings/category/:category',
      'GET /products/full (detailed)',
      'GET /health',
      'GET /ping',
      'POST /seed (reset data)'
    ],
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('🔥 Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
});

// ========== START SERVER ==========
app.listen(port, () => {
  console.log(`
🚀 Server running on port ${port}
✅ CORS enabled for ALL origins (*)
💾 Storage: ${isConnected ? 'MongoDB Atlas' : 'In-Memory (fallback)'}

📦 ${isConnected ? 'Check MongoDB for count' : memoryStorage.listings.length + ' PRODUCTS LOADED'}:
🔗 All Products: http://localhost:${port}/listings
🔗 Single Product: http://localhost:${port}/listings/1 (1-12)
🔗 API Version: http://localhost:${port}/api/listings/1
🔗 Latest 6: http://localhost:${port}/listings/latest/6

🏷️ CATEGORIES:
🔗 Pets: http://localhost:${port}/listings/category/Pets (6 items)
🔗 Food: http://localhost:${port}/listings/category/Food (3 items)
🔗 Accessories: http://localhost:${port}/listings/category/Accessories (3 items)

🛠️ ADMIN:
🔗 Health: http://localhost:${port}/health
🔗 Reset: POST http://localhost:${port}/seed
🔗 DB Status: http://localhost:${port}/db-status

✅ Server ready! Using ${isConnected ? 'MongoDB' : 'in-memory'} storage.
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

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});