const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Product/Listing Info
  productName: {
    type: String,
    required: true,
    trim: true
  },
  listingId: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Pets', 'Food', 'Accessories', 'Care Products', 'Other']
  },
  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  // Buyer Info
  buyerName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  
  // Order Details
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Payment Info (optional)
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'card'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  
  // Timestamps
  orderDate: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate total before saving
orderSchema.pre('save', function(next) {
  if (this.isModified('price') || this.isModified('quantity')) {
    this.totalAmount = this.price * this.quantity;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;