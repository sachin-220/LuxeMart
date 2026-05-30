const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @desc    Get all products with pagination, search, and filter
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const { category, search, page = 1, limit = 12, maxPrice, minRating } = req.query;
    let query = {};

    // Input validation & escaping
    if (category && typeof category === 'string' && category !== 'All') {
        query.category = category;
    }

    if (search && typeof search === 'string') {
        // Safe regex search
        const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.title = { $regex: safeSearch, $options: 'i' };
    }
    
    if (maxPrice) {
        query.price = { ...query.price, $lte: Number(maxPrice) };
    }
    
    if (minRating) {
        query.rating = { $gte: Number(minRating) };
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
    
    const skip = (pageNum - 1) * limitNum;
    
    const products = await Product.find(query).skip(skip).limit(limitNum);
    const total = await Product.countDocuments(query);

    res.json({
        success: true,
        products,
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum
    });
});

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
         return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    
    const product = await Product.findById(id);
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
});

// @desc    Fetch related products (AI Recommendation engine proxy)
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Logic: Same category, not the same product, limit to 4
        // In a real AI system, we'd use vector embeddings of description/price/category
        const related = await Product.find({
            _id: { $ne: product._id },
            category: product.category
        }).limit(4);

        // If not enough in category, fetch random ones to fill the gap
        if (related.length < 4) {
            const extra = await Product.aggregate([
                { $match: { _id: { $ne: product._id }, category: { $ne: product.category } } },
                { $sample: { size: 4 - related.length } }
            ]);
            related.push(...extra);
        }

        res.status(200).json({ success: true, count: related.length, products: related });
    } catch (err) {
        next(err);
    }
};

const Order = require('../models/Order');

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        return res.status(400).json({ success: false, message: 'Product already reviewed by you' });
    }

    // Check if verified purchase
    const hasPurchased = await Order.exists({
        user: req.user._id,
        'orderItems.product': product._id,
        isPaid: true
    });

    const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
        isVerifiedPurchase: !!hasPurchased
    };

    product.reviews.push(review);
    product.reviewCount = product.reviews.length;
    product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

    await product.save();
    res.status(201).json({ success: true, message: 'Review added successfully', product });
});

// @desc    Update a product review
// @route   PUT /api/products/:id/reviews/:reviewId
// @access  Private
const updateProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user is the review owner
    if (review.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized to edit this review' });
    }

    review.rating = Number(rating);
    review.comment = comment;

    product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

    await product.save();
    res.status(200).json({ success: true, message: 'Review updated successfully', product });
});

// @desc    Delete a product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Check if user is the review owner
    if (review.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ success: false, message: 'Not authorized to delete this review' });
    }

    product.reviews.pull(req.params.reviewId);
    product.reviewCount = product.reviews.length;
    
    if (product.reviews.length > 0) {
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;
    } else {
        product.rating = 0;
    }

    await product.save();
    res.status(200).json({ success: true, message: 'Review deleted successfully', product });
});

module.exports = {
    getProducts,
    getProductById,
    getRelatedProducts,
    createProductReview,
    updateProductReview,
    deleteProductReview
};

