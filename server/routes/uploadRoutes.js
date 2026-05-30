const express = require('express');
const { upload } = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload an image to cloudinary
// @access  Private/Admin
router.post('/', protect, authorize('admin', 'user'), upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        res.status(200).json({
            success: true,
            url: req.file.path,
            public_id: req.file.filename
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
