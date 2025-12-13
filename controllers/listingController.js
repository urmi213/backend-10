const Listing = require('../models/Listing');

const transformListing = (listing) => {
  const listingObj = listing.toObject ? listing.toObject() : listing;
  return {
    ...listingObj,
    name: listingObj.title || listingObj.name || 'Unnamed Listing', // Ensure name field exists
    image: listingObj.image || listingObj.imageUrl || '',
    description: listingObj.description || '',
    location: listingObj.location || 'Location not specified',
    category: listingObj.category || 'Uncategorized',
    price: listingObj.price || 0,
    _id: listingObj._id
  };
};

const createListing = async (req, res) => {
  try {
    const data = { ...req.body };
   
    if (!data.title || data.title.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Title is required' 
      });
    }
    
    if (!data.name || data.name.trim() === '') {
      data.name = data.title;
    }
    
    if (data.image === '') {
      data.image = null;
    }
    
    if (data.category === 'Pets') data.price = 0;

    const listing = new Listing(data);
    const saved = await listing.save();
    
    const transformed = transformListing(saved);

    res.status(201).json({ 
      success: true, 
      message: 'Listing created!', 
      data: transformed 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getAllListings = async (req, res) => {
  try {
    const { limit, category, search } = req.query;
    let query = { status: 'active' };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    let listingsQuery = Listing.find(query).sort({ createdAt: -1 });
    
    if (limit) {
      listingsQuery = listingsQuery.limit(parseInt(limit));
    }
    
    const listings = await listingsQuery;
    
    const transformedListings = listings.map(listing => transformListing(listing));
    
    res.json({ 
      success: true, 
      count: transformedListings.length, 
      data: transformedListings 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ 
        success: false,
        message: 'Listing not found' 
      });
    }
    
    const transformed = transformListing(listing);
    
    res.json({ 
      success: true, 
      data: transformed 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const updateListing = async (req, res) => {
  try {
    const updates = req.body;
   
    if (updates.title && (!updates.name || updates.name.trim() === '')) {
      updates.name = updates.title;
    }
    
    if (updates.image === '') {
      updates.image = null;
    }
    
    if (updates.category === 'Pets') {
      updates.price = 0;
    }

    const updated = await Listing.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ 
        success: false,
        message: 'Listing not found' 
      });
    }
    
    const transformed = transformListing(updated);
    
    res.json({ 
      success: true, 
      message: 'Listing updated!', 
      data: transformed 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const deleteListing = async (req, res) => {
  try {
    const deleted = await Listing.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        message: 'Listing not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Listing deleted!' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getListingsByUser = async (req, res) => {
  try {
    const email = req.params.email;
    const listings = await Listing.find({ 
      ownerEmail: email 
    }).sort({ createdAt: -1 });
    
    const transformedListings = listings.map(listing => transformListing(listing));
    
    res.json({
      success: true,
      count: transformedListings.length,
      data: transformedListings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const healthCheck = async (req, res) => {
  try {
    
    await Listing.findOne();
    
    res.json({ 
      success: true, 
      message: 'Backend is running and database is connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection error: ' + error.message 
    });
  }
};

module.exports = {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getListingsByUser,
  healthCheck
};