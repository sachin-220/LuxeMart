const express = require('express');
const { createOrder, getMyOrders, verifyPayment, getOrderById, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, createOrder);

router.route('/myorders')
    .get(protect, getMyOrders);
    
router.route('/:id')
    .get(protect, getOrderById);

router.route('/:id/cancel')
    .put(protect, cancelOrder);
    
router.route('/:id/pay')
    .post(protect, verifyPayment);

module.exports = router;
