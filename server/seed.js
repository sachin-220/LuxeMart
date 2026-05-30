const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const dummyCategoryToLuxeMap = {
    'smartphones': 'Mobiles',
    'laptops': 'Laptops',
    'fragrances': 'Beauty',
    'skincare': 'Beauty',
    'home-decoration': 'Home Decor',
    'furniture': 'Furniture', 
    'tops': 'Fashion',
    'womens-dresses': 'Fashion',
    'womens-shoes': 'Shoes',
    'mens-shirts': 'Fashion',
    'mens-shoes': 'Shoes',
    'mens-watches': 'Watches',
    'womens-watches': 'Watches',
    'womens-bags': 'Fashion',
    'womens-jewellery': 'Fashion',
    'sunglasses': 'Fashion',
    // Purged automotive and motorcycle completely from DummyJSON mappings
};

// --- Target Category Distribution ---
const targetCounts = {
    'Electronics': 20,
    'Fashion': 25,
    'Beauty': 15,
    'Watches': 12,
    'Gaming': 15,
    'Sports': 15,
    'Headphones': 15,
    'Furniture': 15,
    'Home Decor': 15,
    'Mobiles': 15,
    'Laptops': 12,
    'Shoes': 10
};

const mutationSuffixes = {
    'Electronics': [' (2025 Edition)', ' (OLED Display)', ' (Pro Model)', ' (Silver Edition)', ' (Midnight Black)'],
    'Mobiles': [' (256GB Storage)', ' (512GB Storage)', ' (Alpine White)', ' (Space Grey)', ' Pro Max'],
    'Laptops': [' (16GB RAM, 512GB SSD)', ' (M-Series Chip)', ' (Touch Bar Edition)', ' (Matte Black)', ' (Creator Edition)'],
    'Fashion': [' (Oversized Fit)', ' (Slim Fit)', ' (Navy Blue)', ' (Olive Green)', ' (Summer Collection)', ' (Winter Edition)'],
    'Shoes': [' (Running Edition)', ' (All-Black)', ' (White Sneakers)', ' (Breathable Mesh)'],
    'Watches': [' (Leather Strap)', ' (Metal Chain)', ' (Rose Gold Dial)', ' (Smart Edition)', ' (Chronograph)'],
    'Beauty': [' (Travel Size)', ' (Matte Finish)', ' (Glossy Edition)', ' (SPF 50+)', ' (Night Routine)'],
    'Gaming': [' (RGB Edition)', ' (Wireless Version)', ' (Mechanical Blue Switches)', ' (Tournament Edition)'],
    'Headphones': [' (Active Noise Cancelling)', ' (Bass Boosted)', ' (Sport Edition)', ' (Matte Black)'],
    'Sports': [' (Pro Series)', ' (Training Edition)', ' (Advanced Grip)', ' (Lightweight Model)'],
    'Home Decor': [' (Large Size)', ' (Vintage Finish)', ' (Modern Minimalist)', ' (Handcrafted)'],
    'Furniture': [' (Solid Teak Wood)', ' (Premium Fabric)', ' (Ergonomic Design)', ' (Walnut Finish)']
};

const sellers = ['LuxeMart Retail Pvt Ltd', 'Appario Retail', 'Cloudtail India', 'TechNova Solutions', 'Global Traders Hub'];
const hubs = ['Chennai Fulfillment Hub', 'Bengaluru Warehouse', 'Mumbai Mega Hub', 'Delhi Sort Center', 'Hyderabad Logistics'];
const returnPolicies = ['14 days return policy', '7 days replacement', 'Non-returnable', '30 days return policy', 'Installation provided'];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

// --- Curated Arrays ---
const curatedGaming = [
    { title: "Asus ROG Strix G15 Gaming Laptop", brand: "Asus ROG", category: "Gaming", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80" },
    { title: "Razer DeathAdder V2 Gaming Mouse", brand: "Razer", category: "Gaming", image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80" },
    { title: "Logitech G Pro X Mechanical Keyboard", brand: "Logitech", category: "Gaming", image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80" },
    { title: "HyperX Cloud II Gaming Headset", brand: "HyperX", category: "Gaming", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80" },
    { title: "MSI Optix 27-inch Curved Gaming Monitor", brand: "MSI", category: "Gaming", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80" },
    { title: "Sony PlayStation 5 DualSense Controller", brand: "Sony", category: "Gaming", image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80" }
];

const curatedSports = [
    { title: "Nike Air Zoom Pegasus Running Shoes", brand: "Nike", category: "Sports", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80" },
    { title: "Adidas Al Rihla Pro Football", brand: "Adidas", category: "Sports", image: "https://images.unsplash.com/photo-1614632537422-2432a5124115?w=600&q=80" }, 
    { title: "MRF Genius Grand Edition Cricket Bat", brand: "MRF", category: "Sports", image: "https://images.unsplash.com/photo-1593341646782-e0b495cff86d?w=600&q=80" },
    { title: "Spalding NBA Official Basketball", brand: "Spalding", category: "Sports", image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80" },
    { title: "Decathlon Domyos Fitness Yoga Mat", brand: "Decathlon", category: "Sports", image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&q=80" },
    { title: "Fitbit Charge 5 Advanced Fitness Tracker", brand: "Fitbit", category: "Sports", image: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b0?w=600&q=80" }
];

const curatedHeadphones = [
    { title: "Sony WH-1000XM5 Noise Cancelling Headphones", brand: "Sony", category: "Headphones", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&q=80" },
    { title: "Apple AirPods Pro (2nd Gen) Earbuds", brand: "Apple", category: "Headphones", image: "https://images.unsplash.com/photo-1606220588913-b3eaaef05615?w=600&q=80" },
    { title: "Bose QuietComfort 45 Wireless Headphones", brand: "Bose", category: "Headphones", image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80" },
    { title: "JBL Flip 6 Portable Bluetooth Speaker", brand: "JBL", category: "Headphones", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80" },
    { title: "Boat Rockerz 255 Pro+ Wireless Neckband", brand: "Boat", category: "Headphones", image: "https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=600&q=80" },
    { title: "Sony WF-1000XM4 Truly Wireless Earbuds", brand: "Sony", category: "Headphones", image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80" }
];

const curatedElectronics = [
    { title: "Samsung 55-inch 4K Ultra HD Smart QLED TV", brand: "Samsung", category: "Electronics", image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80" },
    { title: "Sony Alpha a7 III Mirrorless Digital Camera", brand: "Sony", category: "Electronics", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80" },
    { title: "Apple iPad Air (5th Gen) 256GB WiFi Tablet", brand: "Apple", category: "Electronics", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80" },
    { title: "TP-Link Archer AX73 WiFi 6 Router", brand: "TP-Link", category: "Electronics", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80" },
    { title: "Amazon Echo Dot (4th Gen) Smart Speaker", brand: "Amazon", category: "Electronics", image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&q=80" },
    { title: "Canon PIXMA G3000 All-in-One Printer", brand: "Canon", category: "Electronics", image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&q=80" },
    { title: "Mi 20000mAh Power Bank 3i", brand: "Xiaomi", category: "Electronics", image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80" }
];

const curatedHomeDecor = [
    { title: "Abstract Canvas Wall Art Set of 3", brand: "Artisan", category: "Home Decor", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80" },
    { title: "Minimalist Brass Table Lamp", brand: "IKEA", category: "Home Decor", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80" },
    { title: "Handwoven Persian Style Area Rug", brand: "Jaipur Rugs", category: "Home Decor", image: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=600&q=80" },
    { title: "Modern Ceramic Vases Set", brand: "HomeTown", category: "Home Decor", image: "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=600&q=80" },
    { title: "Vintage Round Wall Mirror", brand: "UrbanLadder", category: "Home Decor", image: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80" },
    { title: "Velvet Decorative Throw Cushions", brand: "FabIndia", category: "Home Decor", image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&q=80" },
    { title: "Indoor Artificial Monstera Planter", brand: "Generic", category: "Home Decor", image: "https://images.unsplash.com/photo-1602498456745-e9503b30470b?w=600&q=80" }
];

const curatedFashion = [
    { title: "Levi's Men's 511 Slim Fit Jeans", brand: "Levi's", category: "Fashion", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80" },
    { title: "Zara Oversized Cotton Hoodie", brand: "Zara", category: "Fashion", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80" },
    { title: "H&M Women's Floral Summer Dress", brand: "H&M", category: "Fashion", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80" },
    { title: "Tommy Hilfiger Classic Check T-Shirt", brand: "Tommy Hilfiger", category: "Fashion", image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=600&q=80" },
    { title: "Vero Moda Leather Handbag", brand: "Vero Moda", category: "Fashion", image: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=600&q=80" },
    { title: "Ray-Ban Classic Aviator Sunglasses", brand: "Ray-Ban", category: "Fashion", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80" },
    // Expanded Fashion Set
    { title: "Biba Women's Cotton Ethnic Kurti", brand: "Biba", category: "Fashion", image: "https://images.unsplash.com/photo-1583391733958-615f7956a84d?w=600&q=80" },
    { title: "Nalli Premium Silk Banarasi Saree", brand: "Nalli", category: "Fashion", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80" },
    { title: "Allen Solly Men's Formal Suit Jacket", brand: "Allen Solly", category: "Fashion", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80" },
    { title: "Roadster Men's Pure Leather Jacket", brand: "Roadster", category: "Fashion", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80" },
    { title: "Mango Floral Chiffon Maxi Dress", brand: "Mango", category: "Fashion", image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80" }
];

const curatedFurniture = [
    { title: "UrbanLadder Modern Fabric 3-Seater Sofa", brand: "Urban Ladder", category: "Furniture", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80" },
    { title: "IKEA Flintan Ergonomic Office Chair", brand: "IKEA", category: "Furniture", image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=600&q=80" },
    { title: "Pepperfry Solid Wood Dining Table Set", brand: "Pepperfry", category: "Furniture", image: "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?w=600&q=80" },
    { title: "Durian Premium Leather Recliner", brand: "Durian", category: "Furniture", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80" },
    { title: "Nilkamal 3-Door Engineered Wood Wardrobe", brand: "Nilkamal", category: "Furniture", image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&q=80" },
    { title: "Wakefit Solid Wood Bookshelf", brand: "Wakefit", category: "Furniture", image: "https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&q=80" },
    { title: "WoodenStreet Minimalist Coffee Table", brand: "WoodenStreet", category: "Furniture", image: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600&q=80" },
    { title: "HomeTown Contemporary TV Unit", brand: "HomeTown", category: "Furniture", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80" },
    { title: "IKEA Malm Queen Size Bed Frame", brand: "IKEA", category: "Furniture", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80" }
];

async function fetchDummyProducts() {
    console.log('Fetching generic products from DummyJSON...');
    const response = await fetch('https://dummyjson.com/products?limit=150');
    if (!response.ok) throw new Error('Failed to fetch from DummyJSON');
    const data = await response.json();
    return data.products;
}

// --- Smart Keyword-Based Pricing Engine ---
function calculateRealisticPrice(category, title) {
    let min = 299, max = 9999;
    const lowerTitle = title.toLowerCase();

    if (category === 'Furniture') {
        if (lowerTitle.includes('chair')) { min = 3999; max = 15999; }
        else if (lowerTitle.includes('sofa')) { min = 12999; max = 89999; }
        else if (lowerTitle.includes('table')) { min = 8999; max = 59999; }
        else if (lowerTitle.includes('bookshelf')) { min = 2499; max = 12999; }
        else if (lowerTitle.includes('recliner')) { min = 15999; max = 49999; }
        else if (lowerTitle.includes('wardrobe')) { min = 9999; max = 35999; }
        else if (lowerTitle.includes('bed')) { min = 14999; max = 65999; }
        else { min = 2999; max = 49999; }
    }
    else if (category === 'Electronics') {
        if (lowerTitle.includes('router')) { min = 1499; max = 9999; }
        else if (lowerTitle.includes('tv') || lowerTitle.includes('smart tv')) { min = 18999; max = 249999; }
        else if (lowerTitle.includes('power bank')) { min = 799; max = 4999; }
        else if (lowerTitle.includes('camera')) { min = 35999; max = 299999; }
        else if (lowerTitle.includes('tablet') || lowerTitle.includes('ipad')) { min = 15999; max = 129999; }
        else if (lowerTitle.includes('printer')) { min = 4999; max = 24999; }
        else { min = 1999; max = 99999; }
    }
    else if (category === 'Fashion') {
        if (lowerTitle.includes('saree') || lowerTitle.includes('suit') || lowerTitle.includes('jacket')) { min = 1999; max = 9999; }
        else if (lowerTitle.includes('t-shirt') || lowerTitle.includes('shirt')) { min = 399; max = 1999; }
        else if (lowerTitle.includes('hoodie')) { min = 999; max = 4999; }
        else if (lowerTitle.includes('jeans')) { min = 999; max = 3999; }
        else if (lowerTitle.includes('dress') || lowerTitle.includes('kurti')) { min = 899; max = 4999; }
        else if (lowerTitle.includes('bag') || lowerTitle.includes('backpack')) { min = 499; max = 3999; }
        else if (lowerTitle.includes('sunglass')) { min = 499; max = 3499; }
        else { min = 399; max = 7999; }
    }
    else if (category === 'Shoes') {
        if (lowerTitle.includes('sneaker')) { min = 1499; max = 9999; }
        else { min = 499; max = 8999; }
    }
    else if (category === 'Beauty') {
        if (lowerTitle.includes('lipstick')) { min = 199; max = 1499; }
        else if (lowerTitle.includes('perfume') || lowerTitle.includes('fragrance')) { min = 799; max = 9999; }
        else { min = 199; max = 3999; }
    }
    else if (category === 'Gaming') {
        if (lowerTitle.includes('chair')) { min = 7999; max = 29999; }
        else if (lowerTitle.includes('mouse')) { min = 1499; max = 12999; }
        else if (lowerTitle.includes('keyboard')) { min = 2499; max = 18999; }
        else if (lowerTitle.includes('laptop')) { min = 59999; max = 299999; }
        else { min = 1499; max = 120000; }
    }
    else if (category === 'Headphones') {
        if (lowerTitle.includes('earbud') || lowerTitle.includes('airpods')) { min = 999; max = 14999; }
        else if (lowerTitle.includes('studio') || lowerTitle.includes('cancelling')) { min = 4999; max = 24999; }
        else { min = 799; max = 24999; }
    }
    else if (category === 'Sports') { min = 499; max = 9999; }
    else if (category === 'Home Decor') { min = 299; max = 12999; }
    else if (category === 'Mobiles') { min = 9999; max = 129999; }
    else if (category === 'Laptops') { min = 29999; max = 199999; }
    else if (category === 'Watches') { min = 499; max = 14999; }
    
    let originalPrice = getRandomInt(min, max);
    let discountPercentage;

    if (category === 'Furniture') discountPercentage = getRandomInt(5, 25);
    else if (category === 'Fashion' || category === 'Shoes') discountPercentage = getRandomInt(20, 65);
    else discountPercentage = getRandomInt(5, 45);
    
    originalPrice = Math.ceil(originalPrice / 100) * 100 - 1; 
    let finalPrice = Math.ceil(originalPrice - (originalPrice * (discountPercentage / 100)));
    
    if (finalPrice < 1000) {
        let rem = finalPrice % 100;
        if (rem < 50) finalPrice = finalPrice - rem + 49;
        else finalPrice = finalPrice - rem + 99;
    } else {
        let rem = finalPrice % 1000;
        if (rem < 500) finalPrice = finalPrice - rem + 499;
        else finalPrice = finalPrice - rem + 999;
    }

    return { originalPrice, discountPercentage, price: finalPrice };
}

const dummyReviewsPool = [
    { name: "Aarav Sharma", rating: 5, comment: "Absolutely love it! Highly recommended for daily use.", isVerifiedPurchase: true },
    { name: "Aditi Rao", rating: 5, comment: "Premium build quality and fast delivery. Exceeded expectations.", isVerifiedPurchase: true },
    { name: "Vikram Malhotra", rating: 4, comment: "Very satisfied with the performance. Looks very elegant.", isVerifiedPurchase: true },
    { name: "Rohan Gupta", rating: 4, comment: "Decent product, fits description perfectly. Worth the price.", isVerifiedPurchase: false },
    { name: "Neha Verma", rating: 3, comment: "Average quality. The delivery was delayed by two days.", isVerifiedPurchase: true },
    { name: "Suresh Kumar", rating: 2, comment: "Not worth the premium price. Expected better materials.", isVerifiedPurchase: true },
    { name: "Priya Patel", rating: 1, comment: "Defective piece received, requested replacement. Disappointed.", isVerifiedPurchase: true },
    { name: "Karan Johar", rating: 3, comment: "Okay product, but the finishing could be improved.", isVerifiedPurchase: false }
];

function generateReviews() {
    const reviews = [];
    const numReviews = getRandomInt(3, 8);
    for (let i = 0; i < numReviews; i++) {
        const rev = dummyReviewsPool[Math.floor(Math.random() * dummyReviewsPool.length)];
        reviews.push({
            user: new mongoose.Types.ObjectId(),
            name: rev.name,
            rating: rev.rating,
            comment: rev.comment,
            isVerifiedPurchase: rev.isVerifiedPurchase,
            createdAt: new Date(Date.now() - getRandomInt(1, 30) * 24 * 60 * 60 * 1000)
        });
    }
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalRating / reviews.length).toFixed(1));
    return {
        reviews,
        rating: avgRating,
        reviewCount: reviews.length
    };
}

function generateMetadata(category, brand) {
    const stockStatusOptions = ['In Stock', 'Only a few left', 'Available', 'In Stock'];
    const tags = [brand.toLowerCase(), category.toLowerCase()];
    if (Math.random() > 0.7) tags.push('best seller');
    if (Math.random() > 0.8) tags.push('trending');
    
    let days = getRandomInt(1, 4);
    let deliveryEstimation = `Delivery by ${new Date(Date.now() + days * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;
    
    if (category === 'Furniture') {
        days = getRandomInt(5, 9);
        deliveryEstimation = `Delivery in ${days}-${days+2} days. Bulky item shipping.`;
        if (Math.random() > 0.5) tags.push('installation available');
    }

    if (category === 'Electronics' || category === 'Mobiles') {
        tags.push('emi available');
        tags.push('bank offers');
        tags.push('1 year warranty');
    }
    
    if (category === 'Fashion') {
        tags.push('easy exchange');
    }
    
    const reviewData = generateReviews();

    return {
        seller: getRandomElement(sellers),
        shippingHub: getRandomElement(hubs),
        returnPolicy: category === 'Furniture' ? '7 days replacement (Defects only)' : getRandomElement(returnPolicies),
        stock: category === 'Furniture' ? getRandomInt(2, 15) : getRandomInt(5, 150),
        stockStatus: getRandomElement(stockStatusOptions),
        deliveryEstimation,
        tags,
        reviews: reviewData.reviews,
        rating: reviewData.rating,
        reviewCount: reviewData.reviewCount
    };
}

function processDummyProduct(dummyProduct) {
    let category = dummyCategoryToLuxeMap[dummyProduct.category];
    if (!category) return null; // Drop unmapped

    const ltitle = dummyProduct.title.toLowerCase();

    // Explicit rejection for automotive/bike items masquerading as Fashion
    if (ltitle.includes('motorcycle') || ltitle.includes('bike') || ltitle.includes('helmet') || ltitle.includes('automotive')) {
        return null;
    }

    if (category === 'Furniture' && ltitle.includes('clock')) {
        category = 'Home Decor';
    }
    if (ltitle.includes('necklace') || ltitle.includes('sunglass')) {
        category = 'Fashion';
    }

    const pricing = calculateRealisticPrice(category, dummyProduct.title);
    const metadata = generateMetadata(category, dummyProduct.brand || 'Generic');
    
    let image = dummyProduct.thumbnail;
    if (dummyProduct.images && dummyProduct.images.length > 0) image = dummyProduct.images[0];

    return {
        title: dummyProduct.title,
        brand: dummyProduct.brand || 'Generic',
        category: category,
        price: pricing.price,
        originalPrice: pricing.originalPrice,
        discountPercentage: pricing.discountPercentage,
        description: dummyProduct.description || 'Premium quality product imported globally.',
        image: image,
        ...metadata
    };
}

function processCuratedProduct(item) {
    const pricing = calculateRealisticPrice(item.category, item.title);
    const metadata = generateMetadata(item.category, item.brand);
    
    return {
        ...item,
        price: pricing.price,
        originalPrice: pricing.originalPrice,
        discountPercentage: pricing.discountPercentage,
        description: `Premium ${item.category} equipment engineered for maximum performance and durability. Tested by professionals.`,
        ...metadata
    };
}

async function seedDatabase() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('Please define MONGODB_URI in .env file.');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        await Product.deleteMany({});
        console.log('Cleared existing products');

        const seenTitles = new Set();
        let allProducts = [];

        // 1. Process DummyJSON
        const dummyRaw = await fetchDummyProducts();
        for (const item of dummyRaw) {
            const processed = processDummyProduct(item);
            if (processed && !seenTitles.has(processed.title)) {
                seenTitles.add(processed.title);
                allProducts.push(processed);
            }
        }

        // 2. Inject Curated Specialized Data
        const curatedArrays = [curatedGaming, curatedSports, curatedHeadphones, curatedElectronics, curatedHomeDecor, curatedFashion, curatedFurniture];
        
        for (const curatedList of curatedArrays) {
            for (const item of curatedList) {
                if (!seenTitles.has(item.title)) {
                    seenTitles.add(item.title);
                    allProducts.push(processCuratedProduct(item));
                    
                    // Simple First Mutation
                    const mutantSuffix = mutationSuffixes[item.category] ? getRandomElement(mutationSuffixes[item.category]) : " (Edition 2)";
                    const mutantTitle = item.title + mutantSuffix;
                    
                    if (!seenTitles.has(mutantTitle)) {
                        seenTitles.add(mutantTitle);
                        const mutant = { ...item, title: mutantTitle };
                        allProducts.push(processCuratedProduct(mutant));
                    }
                }
            }
        }

        // 3. Intelligent Category Density Balancer
        const categoryCounts = allProducts.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        }, {});
        
        let balancedProducts = [...allProducts];
        
        for (const cat of Object.keys(targetCounts)) {
            const target = targetCounts[cat];
            let current = categoryCounts[cat] || 0;
            
            if (current < target) {
                const itemsInCat = allProducts.filter(p => p.category === cat);
                if (itemsInCat.length === 0) continue; // Can't mutate if empty
                
                let needed = target - current;
                let failSafe = 0;
                
                while(needed > 0 && failSafe < 100) {
                    failSafe++;
                    const source = getRandomElement(itemsInCat);
                    const suffixList = mutationSuffixes[cat] || [' V2', ' Premium', ' Limited Edition', ' Classic'];
                    const chosenSuffix = getRandomElement(suffixList);
                    
                    // To prevent completely identical bases, strip existing parens if we want a new suffix
                    let baseTitle = source.title.replace(/\s*\(.*?\)\s*/g, ''); 
                    let mutantTitle = baseTitle + chosenSuffix;
                    
                    // Further randomness to ensure uniqueness
                    if (seenTitles.has(mutantTitle)) {
                        mutantTitle = baseTitle + chosenSuffix + ` - Series ${getRandomInt(3, 9)}`;
                    }
                    
                    if (!seenTitles.has(mutantTitle)) {
                        seenTitles.add(mutantTitle);
                        const mutant = { ...source, title: mutantTitle };
                        const newPricing = calculateRealisticPrice(cat, mutantTitle);
                        mutant.price = newPricing.price;
                        mutant.originalPrice = newPricing.originalPrice;
                        mutant.discountPercentage = newPricing.discountPercentage;
                        
                        balancedProducts.push(mutant);
                        needed--;
                    }
                }
            }
        }
        
        await Product.insertMany(balancedProducts);
        console.log(`Successfully inserted ${balancedProducts.length} intelligently balanced products.`);
        
        const finalCounts = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        console.log('Final Category Distribution:', finalCounts);

        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
