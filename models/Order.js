const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true
  },
  productId: {
    type: String,
    required: [true, 'Product ID is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required']
  },
  buyerName: {
    type: String,
    required: [true, 'Buyer name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  additionalNotes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate order ID before saving
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    this.orderId = `ORD${timestamp}${random}`;
  }
  next();
});

// Static method to get orders by buyer email
orderSchema.statics.findByBuyerEmail = function(email, status = null) {
  let query = { email: email.toLowerCase() };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;