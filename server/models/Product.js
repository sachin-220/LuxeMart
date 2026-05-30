const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: false }
}, {
    timestamps: true
});

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discountPercentage: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 10 },
    deliveryEstimation: { type: String },
    image: { type: String, required: true },
    description: { type: String },
    reviews: [reviewSchema],
    // Marketplace Metadata fields
    seller: { type: String, default: 'LuxeMart Retail Pvt Ltd' },
    shippingHub: { type: String, default: 'Bengaluru Fulfillment Hub' },
    tags: { type: [String], default: [] },
    returnPolicy: { type: String, default: '14 days return policy' },
    stockStatus: { type: String, default: 'In Stock' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

