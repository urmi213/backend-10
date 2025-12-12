const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Pets', 'Food', 'Accessories', 'Care Products'],
      message: '{VALUE} is not a valid category'
    },
    default: 'Pets'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    default: 0,
    validate: {
      validator: function(v) {
        return typeof v === 'number';
      },
      message: 'Price must be a number'
    }
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  contactInfo: {
    type: String,
    default: ''
  },
  additionalInfo: {
    type: String,
    default: ''
  },
  owner: {
    type: String,
    default: 'Anonymous'
  },
  ownerEmail: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'pending', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true
});

listingSchema.pre('save', function(next) {
  if (this.price !== undefined && this.price !== null) {
    this.price = parseFloat(this.price);
    if (isNaN(this.price)) {
      this.price = 0;
    }
  }
  
  if (this.category === 'Pets') {
    this.price = 0;
  }
  
  next();
});

listingSchema.index({ title: 'text', description: 'text' });

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
