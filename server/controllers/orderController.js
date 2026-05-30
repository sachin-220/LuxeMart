const Order = require('../models/Order');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Product = require('../models/Product');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_SECRET || 'secret_placeholder'
});

// @desc    Create new order & Razorpay order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice, membershipPlan, membershipSavings } = req.body;

        if (orderItems && orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        }

        // Validate available stock before creating order
        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
            }
            if (product.stock < item.qty) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient stock for ${product.title}. Only ${product.stock} units left in stock.` 
                });
            }
        }

        const trackingId = `LM-${Math.floor(100000 + Math.random() * 900000)}`;
        const courierPartner = 'LuxeMart Express';
        const shipmentHub = 'Bengaluru Fulfillment Hub';
        const estDate = new Date();
        estDate.setDate(estDate.getDate() + 3);

        const order = new Order({
            user: req.user._id,
            orderItems,
            shippingAddress,
            paymentMethod: paymentMethod || 'Razorpay',
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            courierPartner,
            shipmentStage: 'Ordered',
            trackingId,
            shipmentHub,
            estimatedDelivery: estDate,
            membershipPlan: membershipPlan || 'Basic',
            membershipSavings: membershipSavings || 0.0
        });
        
        const createdOrder = await order.save();

        // Create Razorpay Order
        let razorpayOrder;
        try {
            if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_placeholder') {
                throw new Error('Using placeholder keys');
            }
            const options = {
                amount: Math.round(totalPrice * 100), // amount in the smallest currency unit (paise)
                currency: 'INR',
                receipt: `receipt_order_${createdOrder._id}`
            };
            razorpayOrder = await razorpay.orders.create(options);
        } catch (razorpayErr) {
            console.log('Using mock Razorpay order for development:', razorpayErr.message);
            razorpayOrder = {
                id: `order_mock_${Math.random().toString(36).substring(2, 10)}${Date.now().toString().substring(8)}`,
                amount: Math.round(totalPrice * 100),
                currency: 'INR',
                receipt: `receipt_order_${createdOrder._id}`,
                status: 'created'
            };
        }

        res.status(201).json({
            success: true,
            order: createdOrder,
            razorpayOrder
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/orders/:id/pay
// @access  Private
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Verify Signature
        const secret = process.env.RAZORPAY_SECRET || 'secret_placeholder';
        let isAuthentic = false;

        if (razorpay_order_id && razorpay_order_id.startsWith('order_mock_')) {
            isAuthentic = razorpay_payment_id === 'pay_mock_success';
        } else {
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto.createHmac('sha256', secret)
                                             .update(body.toString())
                                             .digest('hex');
            isAuthentic = expectedSignature === razorpay_signature;
        }
        
        if (isAuthentic) {
            // Re-validate and atomically deduct stock
            for (const item of order.orderItems) {
                const product = await Product.findOneAndUpdate(
                    { _id: item.product, stock: { $gte: item.qty } },
                    { $inc: { stock: -item.qty } },
                    { new: true }
                );
                if (!product) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Insufficient stock for ${item.name}. Transaction aborted.` 
                    });
                }
            }

            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature || 'mock_signature',
                status: 'Paid'
            };
            
            const updatedOrder = await order.save();
            res.status(200).json({ success: true, order: updatedOrder });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email phoneNumber');
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        // Ownership check: only order owner or admin can access
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to view this order' });
        }
        
        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Cancel order & handle refund/inventory
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        // Simple sanitization to strip potential HTML/script tags from reason
        const sanitizedReason = reason ? reason.replace(/<[^>]*>/g, '').trim() : 'Cancelled by customer';
        
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        // Ownership check
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to cancel this order' });
        }
        
        // Status check: Shipped/Delivered/Cancelled/Refunded cannot be cancelled
        if (order.shipmentStage !== 'Ordered' && order.shipmentStage !== 'Packed') {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot cancel order at '${order.shipmentStage}' stage. Only Ordered or Packed orders can be cancelled.` 
            });
        }
        
        // Restore stock
        for (const item of order.orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: item.qty }
            });
        }
        
        order.cancellationDate = new Date();
        order.cancellationReason = sanitizedReason;
        
        // If order was paid, simulate Refund Initiated
        if (order.isPaid) {
            order.shipmentStage = 'Refund Initiated';
            order.refundAmount = order.totalPrice;
            order.refundDate = new Date();
            
            // Simulate Refund Completed after 10 seconds automatically
            const orderId = order._id;
            setTimeout(async () => {
                try {
                    await Order.findByIdAndUpdate(orderId, {
                        shipmentStage: 'Refund Completed',
                        refundDate: new Date()
                    });
                    console.log(`[Refund Simulation] Refund completed automatically for order ${orderId}`);
                } catch (timeoutErr) {
                    console.error('Error in refund timeout simulation:', timeoutErr.message);
                }
            }, 10000);
        } else {
            order.shipmentStage = 'Cancelled';
        }
        
        const updatedOrder = await order.save();
        res.status(200).json({ success: true, order: updatedOrder });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
