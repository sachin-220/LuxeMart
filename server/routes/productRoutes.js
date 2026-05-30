const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getProductById, 
    getRelatedProducts,
    createProductReview,
    updateProductReview,
    deleteProductReview
} = require('../controllers/productController');
const { validatePagination, sanitizeSearch } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');

router.get('/', sanitizeSearch, validatePagination, getProducts);
router.route('/:id').get(getProductById);
router.route('/:id/related').get(getRelatedProducts);

router.route('/:id/reviews').post(protect, createProductReview);
router.route('/:id/reviews/:reviewId')
    .put(protect, updateProductReview)
    .delete(protect, deleteProductReview);

module.exports = router;

