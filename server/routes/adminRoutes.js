const express = require('express');
const {
    createProduct,
    updateProduct,
    deleteProduct,
    getOrders,
    updateOrderShipment,
    getUsers
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth and admin role to all routes in this file
router.use(protect);
router.use(authorize('admin'));

router.route('/products')
    .post(createProduct);
    
router.route('/products/:id')
    .put(updateProduct)
    .delete(deleteProduct);

router.route('/orders')
    .get(getOrders);
    
router.route('/orders/:id/shipment')
    .put(updateOrderShipment);

router.route('/users')
    .get(getUsers);

module.exports = router;
