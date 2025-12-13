const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://pawmart_user:RlJ9RGOVkxXSFL3z@petshopcluster.9k2rmcx.mongodb.net/pawmartDB?retryWrites=true&w=majority&appName=PetShopCluster";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
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
    name: 'Cat Scratching Post',
    category: 'Accessories',
    price: 35,
    location: 'Khulna',
    image: 'https://images.unsplash.com/photo-1514888286974-6d03bdeacba8?w=800&auto=format&fit=crop&q=80',
    description: 'Durable scratching post with sisal rope',
    sellerName: 'Pet Accessories BD',
    email: 'accessories@example.com',
    date: '2025-10-30'
  },
  {
    _id: '5',
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
    _id: '6',
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
    await client.connect();
    console.log("✅ Connected to MongoDB");
    
    const database = client.db("pawmartDB");
    listingsCollection = database.collection("listings");
    ordersCollection = database.collection("orders");
    
    // Create collections if they don't exist
    const collections = await database.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    if (!collectionNames.includes('listings')) {
      await database.createCollection('listings');
      console.log('📝 Created listings collection');
      
      if (await listingsCollection.countDocuments() === 0) {
        await listingsCollection.insertMany(mockListings);
        console.log('📝 Inserted sample listings');
      }
    }
    
    if (!collectionNames.includes('orders')) {
      await database.createCollection('orders');
      console.log('📝 Created orders collection');
     
      await ordersCollection.createIndex({ email: 1 });
      await ordersCollection.createIndex({ createdAt: -1 });
      console.log('📝 Created indexes for orders collection');
    }
    
    return true;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    return false;
  }
}


connectToMongoDB().then(isConnected => {
  if (isConnected) {
    console.log('✅ MongoDB ready');
  } else {
    console.log('⚠️ Using mock data mode');
  }
});


app.get('/', (req, res) => {
  res.send('PawMart Backend Server is Running! 🐾');
});

app.get('/health', (req, res) => {
  const mongoStatus = listingsCollection ? 'Connected' : 'Disconnected';
  res.json({ 
    success: true, 
    message: 'Server is healthy', 
    timestamp: new Date().toISOString(),
    mongoDB: mongoStatus,
    endpoints: {
      latest: '/listings/latest',
      all: '/listings',
      categories: '/listings/category/:category'
    }
  });
});


app.get('/listings/latest', async (req, res) => {
  try {
    console.log('📥 GET /listings/latest requested');
    
    if (listingsCollection) {
      const cursor = listingsCollection.find().sort({ _id: -1 }).limit(6);
      const listings = await cursor.toArray();
      
      console.log(`✅ Sending ${listings.length} latest listings from MongoDB`);
      res.json(listings);
      
    } else {
      console.log('✅ Sending mock latest listings');
      res.json(mockListings.slice(0, 6));
    }
  } catch (error) {
    console.error('❌ Error in /listings/latest:', error);
    res.json(mockListings.slice(0, 6));
  }
});

app.get('/listings', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    if (listingsCollection) {
      const cursor = listingsCollection.find().sort({ _id: -1 }).limit(limit);
      const listings = await cursor.toArray();
      res.json(listings);
    } else {
      res.json(mockListings.slice(0, limit));
    }
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.json(mockListings.slice(0, 20));
  }
});

app.get('/listings/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    
    if (listingsCollection) {
      const cursor = listingsCollection.find({ category });
      const listings = await cursor.toArray();
      res.json(listings);
    } else {
      const filtered = mockListings.filter(item => item.category === category);
      res.json(filtered);
    }
  } catch (error) {
    console.error('Error fetching category listings:', error);
    const filtered = mockListings.filter(item => item.category === req.params.category);
    res.json(filtered);
  }
});

app.get('/listings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    if (listingsCollection && ObjectId.isValid(id)) {
      const query = { _id: new ObjectId(id) };
      const listing = await listingsCollection.findOne(query);
      
      if (listing) {
        res.json(listing);
      } else {
        const mockListing = mockListings.find(item => item._id === id);
        if (mockListing) {
          res.json(mockListing);
        } else {
          res.status(404).json({ 
            success: false, 
            message: 'Listing not found' 
          });
        }
      }
    } else {
      const mockListing = mockListings.find(item => item._id === id);
      if (mockListing) {
        res.json(mockListing);
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Listing not found' 
        });
      }
    }
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch listing' 
    });
  }
});

// ✅ POST Add New Listing
app.post('/listings', async (req, res) => {
  try {
    const listing = req.body;
    
    if (listingsCollection) {
      const result = await listingsCollection.insertOne(listing);
      res.json({ 
        success: true, 
        message: 'Listing added successfully',
        insertedId: result.insertedId
      });
    } else {
      listing._id = new ObjectId().toString();
      mockListings.unshift(listing);
      res.json({ 
        success: true, 
        message: 'Listing added to mock data',
        insertedId: listing._id
      });
    }
  } catch (error) {
    console.error('Error adding listing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add listing' 
    });
  }
});

// ✅ PUT Update Listing
app.put('/listings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updatedListing = req.body;
    
    if (listingsCollection && ObjectId.isValid(id)) {
      const result = await listingsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedListing }
      );
      
      if (result.modifiedCount > 0) {
        res.json({ 
          success: true, 
          message: 'Listing updated successfully' 
        });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Listing not found' 
        });
      }
    } else {
      const index = mockListings.findIndex(item => item._id === id);
      if (index !== -1) {
        mockListings[index] = { ...mockListings[index], ...updatedListing };
        res.json({ 
          success: true, 
          message: 'Mock listing updated' 
        });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Listing not found' 
        });
      }
    }
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update listing' 
    });
  }
});

// ✅ DELETE Listing
app.delete('/listings/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    if (listingsCollection && ObjectId.isValid(id)) {
      const result = await listingsCollection.deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount > 0) {
        res.json({ 
          success: true, 
          message: 'Listing deleted successfully' 
        });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Listing not found' 
        });
      }
    } else {
      const index = mockListings.findIndex(item => item._id === id);
      if (index !== -1) {
        mockListings.splice(index, 1);
        res.json({ 
          success: true, 
          message: 'Mock listing deleted' 
        });
      } else {
        res.status(404).json({ 
          success: false, 
          message: 'Listing not found' 
        });
      }
    }
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete listing' 
    });
  }
});

//  ORDERS ROUTES 


app.post('/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    
    const completeOrder = {
      productId: orderData.productId || '',
      productName: orderData.productName || 'Unnamed Product',
      buyerName: orderData.buyerName || 'Customer',
      email: (orderData.email || '').toLowerCase().trim(),
      quantity: parseInt(orderData.quantity) || 1,
      price: parseFloat(orderData.price) || 0,
      address: orderData.address || '',
      phone: (orderData.phone || '').toString().replace(/\s/g, ''),
      date: orderData.date || new Date().toISOString().split('T')[0],
      additionalNotes: orderData.additionalNotes || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (ordersCollection) {
      const result = await ordersCollection.insertOne(completeOrder);
      res.status(201).json({ 
        success: true, 
        message: 'Order placed successfully!',
        data: {
          _id: result.insertedId,
          ...completeOrder
        }
      });
    } else {
      completeOrder._id = new ObjectId().toString();
      res.status(201).json({ 
        success: true, 
        message: 'Order placed successfully (mock mode)',
        data: completeOrder
      });
    }
    
  } catch (error) {
    console.error('❌ Error placing order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to place order',
      error: error.message
    });
  }
});

app.get('/orders/user/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    
    if (ordersCollection) {
      const cursor = ordersCollection.find({ email }).sort({ createdAt: -1 });
      const orders = await cursor.toArray();
      res.json(orders);
    } else {
      
      const mockOrders = [
        {
          _id: '1',
          productId: 'mock-123',
          productName: 'Golden Retriever Puppy',
          buyerName: 'Test User',
          email: email,
          quantity: 1,
          price: 0,
          address: '123 Main St, Dhaka',
          phone: '01712345678',
          date: '2024-01-15',
          additionalNotes: 'Demo order',
          status: 'completed',
          createdAt: new Date('2024-01-15')
        }
      ];
      res.json(mockOrders);
    }
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders' 
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`🛒 Latest listings: http://localhost:${port}/listings/latest`);
  console.log(`📋 All listings: http://localhost:${port}/listings`);
  console.log(`🐾 Categories: http://localhost:${port}/listings/category/Pets`);
});

process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});