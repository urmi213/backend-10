const mongoose = require('mongoose');
const Listing = require('./models/Listing');
const Order = require('./models/Order');

// MongoDB connection
const MONGODB_URI = 'mongodb://localhost:27017/pawmart';

// Sample data
const sampleListings = [
  {
    name: "Golden Retriever Puppy",
    category: "Pets",
    price: 0,
    location: "Dhaka, Bangladesh",
    description: "Friendly 2-month-old Golden Retriever puppy. Vaccinated, dewormed, and very playful. Looking for a loving forever home.",
    image: "https://images.unsplash.com/photo-1596273315327-5f0593124a6a?w=800&auto=format&fit=crop",
    email: "john.doe@example.com",
    date: new Date("2024-12-10"),
    phone: "+8801712345678",
    status: "available"
  },
  {
    name: "Premium Dog Food - 5kg",
    category: "Food",
    price: 25.99,
    location: "Chattogram, Bangladesh",
    description: "High-quality dog food with all essential nutrients. Contains real chicken, vegetables, and vitamins. Perfect for adult dogs.",
    image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w-800&auto=format&fit=crop",
    email: "pet.shop@example.com",
    date: new Date("2024-12-05"),
    phone: "+8801812345678",
    status: "available"
  },
  {
    name: "Persian Kitten - White",
    category: "Pets",
    price: 0,
    location: "Sylhet, Bangladesh",
    description: "Beautiful white Persian kitten, 3 months old. Litter trained, vaccinated, and very affectionate. Great with children.",
    image: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&auto=format&fit=crop",
    email: "sarah.khan@example.com",
    date: new Date("2024-12-12"),
    phone: "+8801912345678",
    status: "available"
  },
  {
    name: "Dog Leash & Collar Set",
    category: "Accessories",
    price: 12.50,
    location: "Khulna, Bangladesh",
    description: "Premium leather dog leash with matching collar. Adjustable size, durable material. Available in multiple colors.",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&auto=format&fit=crop",
    email: "accessories.shop@example.com",
    date: new Date("2024-12-08"),
    phone: "+8801612345678",
    status: "available"
  },
  {
    name: "Pet Shampoo - Sensitive Skin",
    category: "Care Products",
    price: 8.99,
    location: "Rajshahi, Bangladesh",
    description: "Gentle shampoo specially formulated for pets with sensitive skin. pH balanced, tear-free formula with aloe vera.",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop",
    email: "care.products@example.com",
    date: new Date("2024-12-15"),
    phone: "+8801512345678",
    status: "available"
  },
  {
    name: "Labrador Retriever - 1 Year",
    category: "Pets",
    price: 0,
    location: "Barisal, Bangladesh",
    description: "Healthy 1-year-old Labrador Retriever. House trained, good with other pets, and loves outdoor activities.",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&auto=format&fit=crop",
    email: "mike.wilson@example.com",
    date: new Date("2024-12-03"),
    phone: "+8801412345678",
    status: "available"
  },
  {
    name: "Cat Toy Set - 5 Pieces",
    category: "Accessories",
    price: 15.75,
    location: "Rangpur, Bangladesh",
    description: "Interactive toy set for cats. Includes feather wand, balls, scratching post, and laser pointer. Hours of fun!",
    image: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=800&auto=format&fit=crop",
    email: "cat.world@example.com",
    date: new Date("2024-12-18"),
    phone: "+8801312345678",
    status: "available"
  },
  {
    name: "Bird Food Mix - 2kg",
    category: "Food",
    price: 7.99,
    location: "Mymensingh, Bangladesh",
    description: "Nutritious food mix for all types of birds. Contains seeds, grains, and essential vitamins for healthy feathers.",
    image: "https://images.unsplash.com/photo-1551085254-e96b210db58a?w=800&auto=format&fit=crop",
    email: "bird.paradise@example.com",
    date: new Date("2024-12-20"),
    phone: "+8801212345678",
    status: "available"
  }
];

const sampleOrders = [
  {
    productId: null, // Will be set after listings are created
    productName: "Golden Retriever Puppy",
    buyerName: "Mr. Ahmed Rahman",
    email: "ahmed.rahman@example.com",
    quantity: 1,
    price: 0,
    address: "House 123, Road 45, Gulshan, Dhaka",
    phone: "+8801711122233",
    date: new Date("2024-12-20"),
    additionalNotes: "Will pick up on weekend",
    status: "confirmed",
    paymentMethod: "cash"
  },
  {
    productId: null, // Will be set after listings are created
    productName: "Premium Dog Food - 5kg",
    buyerName: "Ms. Fatima Begum",
    email: "fatima.begum@example.com",
    quantity: 2,
    price: 25.99,
    address: "Flat 5B, Building 78, Banani, Dhaka",
    phone: "+8801811223344",
    date: new Date("2024-12-22"),
    additionalNotes: "Please deliver before 5 PM",
    status: "delivered",
    paymentMethod: "online",
    paymentStatus: "paid"
  },
  {
    productId: null, // Will be set after listings are created
    productName: "Persian Kitten - White",
    buyerName: "Mr. Karim Ahmed",
    email: "karim.ahmed@example.com",
    quantity: 1,
    price: 0,
    address: "Village: Shibpur, District: Narsingdi",
    phone: "+8801912334455",
    date: new Date("2024-12-25"),
    additionalNotes: "Looking for a companion for my elderly mother",
    status: "pending",
    paymentMethod: "cash"
  }
];

async function seedDatabase() {
  try {
    console.log('='.repeat(50));
    console.log('🌱 STARTING DATABASE SEEDING');
    console.log('='.repeat(50));
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await Listing.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
    // Insert sample listings
    const createdListings = await Listing.insertMany(sampleListings);
    console.log(`✅ Created ${createdListings.length} listings`);
    
    // Update orders with actual product IDs
    const updatedOrders = sampleOrders.map((order, index) => {
      const listingIndex = index % createdListings.length;
      return {
        ...order,
        productId: createdListings[listingIndex]._id
      };
    });
    
    // Insert sample orders
    const createdOrders = await Order.insertMany(updatedOrders);
    console.log(`✅ Created ${createdOrders.length} orders`);
    
    // Update listing status for ordered items
    for (const order of createdOrders) {
      await Listing.findByIdAndUpdate(order.productId, { 
        status: 'pending' 
      });
    }
    
    // Display summary
    console.log('\n📊 SEEDING SUMMARY:');
    console.log('='.repeat(30));
    console.log(`Listings: ${createdListings.length}`);
    console.log(`Orders: ${createdOrders.length}`);
    
    const listingStats = await Listing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📈 Listings by Category:');
    listingStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });
    
    const orderStats = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📈 Orders by Status:');
    orderStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });
    
    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n💡 Next steps:');
    console.log('1. Start the backend: npm run dev');
    console.log('2. Test API: http://localhost:5000/health');
    console.log('3. View listings: http://localhost:5000/api/listings');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();