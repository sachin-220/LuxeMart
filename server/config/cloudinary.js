const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock_cloud_name',
    api_key: process.env.CLOUDINARY_API_KEY || 'mock_api_key',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'mock_api_secret'
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'luxemart',
        allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
