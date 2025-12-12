const express = require('express');
const router = express.Router();

const {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  getListingsByUser
} = require('../controllers/listingController');

// Specific routes first
router.get('/user/:email', getListingsByUser);

// NEW latest listings route
router.get('/latest', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const listingsCollection = db.collection('listings');

    const listings = await listingsCollection
      .find()
      .sort({ _id: -1 })
      .limit(6)
      .toArray();

    res.json({
      success: true,
      data: listings,
      count: listings.length
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest listings",
      error: err.message
    });
  }
});

// CRUD routes
router.post('/', createListing);
router.get('/', getAllListings);
router.get('/:id', getListingById);
router.put('/:id', updateListing);
router.delete('/:id', deleteListing);

module.exports = router;
