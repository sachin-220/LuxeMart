import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { OrderContext } from '../context/OrderContext';
import { 
    Package, Search, MapPin, Truck, Check, FileText, 
    XCircle, RefreshCw, Eye, ShoppingCart, Star 
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import ImageWithFallback from '../components/ImageWithFallback';
import toast from 'react-hot-toast';

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const Orders = () => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const { orders: allOrders, loading, fetchOrders } = useContext(OrderContext);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('Orders');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    
    // Detailed Order Modal
    const [selectedOrder, setSelectedOrder] = useState(null);
    
    // Cancellation Modal
    const [cancelModal, setCancelModal] = useState({ open: false, orderId: null, reason: '' });
    
    // Feedback and Review Modals
    const [feedbackModal, setFeedbackModal] = useState({ open: false, orderId: null, seller: '', rating: 0, comment: '' });
    const [reviewModal, setReviewModal] = useState({ open: false, item: null, rating: 0, title: '', comment: '' });

    const debouncedSetSearchQuery = useCallback(
        debounce((val) => setDebouncedSearchQuery(val), 300),
        []
    );

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const filteredOrders = useMemo(() => {
        let result = allOrders;
        
        // Filter by Tab
        if (activeTab === 'Not Yet Shipped') {
            result = result.filter(o => o.shipmentStage === 'Ordered' || o.shipmentStage === 'Packed');
        } else if (activeTab === 'Cancelled Orders') {
            result = result.filter(o => o.shipmentStage === 'Cancelled' || o.shipmentStage === 'Refund Initiated' || o.shipmentStage === 'Refund Completed');
        } else if (activeTab === 'Buy Again') {
            result = result.filter(o => o.shipmentStage !== 'Cancelled' && o.shipmentStage !== 'Refund Initiated' && o.shipmentStage !== 'Refund Completed');
        }
        
        // Filter by Search Query
        if (debouncedSearchQuery.trim() !== '') {
            const query = debouncedSearchQuery.toLowerCase();
            result = result.filter(order => 
                order._id.toLowerCase().includes(query) ||
                order.orderItems.some(item => item.name.toLowerCase().includes(query))
            );
        }
        
        return result;
    }, [activeTab, debouncedSearchQuery, allOrders]);

    if (!user) {
        return (
            <div className="container empty-state fade-in" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <h2>Please Sign In</h2>
                <p>You need to be signed in to view your orders.</p>
                <button className="btn btn-primary" onClick={() => navigate('/signin')}>Sign In</button>
            </div>
        );
    }

    const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

    const handleReorder = (item) => {
        addToCart({
            _id: item.product,
            title: item.name,
            image: item.image,
            price: item.price
        }, 1);
        toast.success(`Added ${item.name} to cart`);
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        debouncedSetSearchQuery(val);
    };

    // Cancellation Action
    const openCancelModal = (orderId) => {
        setCancelModal({ open: true, orderId, reason: '' });
    };

    const submitCancellation = async () => {
        if (!cancelModal.reason.trim()) {
            toast.error("Please provide a reason for cancellation");
            return;
        }

        const toastId = toast.loading("Processing order cancellation...");
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/${cancelModal.orderId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reason: cancelModal.reason })
            });

            const data = await res.json();
            if (data.success) {
                toast.success(
                    data.order.shipmentStage === 'Refund Initiated' 
                        ? "Order cancelled! Refund has been initiated." 
                        : "Order cancelled successfully!", 
                    { id: toastId }
                );
                setCancelModal({ open: false, orderId: null, reason: '' });
                if (selectedOrder && selectedOrder._id === data.order._id) {
                    setSelectedOrder(data.order);
                }
                fetchOrders(true);
            } else {
                toast.error(data.message || "Failed to cancel order", { id: toastId });
            }
        } catch (err) {
            console.error("Cancellation error:", err);
            toast.error("Network error. Please try again.", { id: toastId });
        }
    };

    const submitFeedback = () => {
        if (feedbackModal.rating === 0) {
            toast.error("Please provide a rating");
            return;
        }
        const existing = JSON.parse(localStorage.getItem('sellerFeedback')) || {};
        existing[feedbackModal.seller] = { rating: feedbackModal.rating, comment: feedbackModal.comment };
        localStorage.setItem('sellerFeedback', JSON.stringify(existing));
        toast.success("Seller feedback submitted successfully!");
        setFeedbackModal({ open: false, orderId: null, seller: '', rating: 0, comment: '' });
    };

    const submitReview = () => {
        if (reviewModal.rating === 0) {
            toast.error("Please provide a rating");
            return;
        }
        const existing = JSON.parse(localStorage.getItem('productReviews')) || {};
        if (!existing[reviewModal.item._id]) {
            existing[reviewModal.item._id] = [];
        }
        existing[reviewModal.item._id].push({
            user: user.name,
            rating: reviewModal.rating,
            title: reviewModal.title,
            comment: reviewModal.comment,
            date: new Date().toLocaleDateString()
        });
        localStorage.setItem('productReviews', JSON.stringify(existing));
        toast.success("Product review published!");
        setReviewModal({ open: false, item: null, rating: 0, title: '', comment: '' });
    };

    const getStatusStyle = (stage) => {
        switch (stage) {
            case 'Ordered':
                return { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.2)' };
            case 'Packed':
                return { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)' };
            case 'Shipped':
                return { bg: 'rgba(139, 92, 246, 0.1)', color: '#7c3aed', border: '1px solid rgba(139, 92, 246, 0.2)' };
            case 'Out for Delivery':
                return { bg: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', border: '1px solid rgba(99, 102, 241, 0.2)' };
            case 'Delivered':
                return { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' };
            case 'Cancelled':
                return { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)' };
            case 'Refund Initiated':
                return { bg: 'rgba(249, 115, 22, 0.1)', color: '#ea580c', border: '1px solid rgba(249, 115, 22, 0.2)' };
            case 'Refund Completed':
                return { bg: 'rgba(20, 184, 166, 0.1)', color: '#0d9488', border: '1px solid rgba(20, 184, 166, 0.2)' };
            default:
                return { bg: 'rgba(107, 114, 128, 0.1)', color: '#4b5563', border: '1px solid rgba(107, 114, 128, 0.2)' };
        }
    };

    const renderTrackingTimeline = (orderToTrack) => {
        const isCancelled = ['Cancelled', 'Refund Initiated', 'Refund Completed'].includes(orderToTrack.shipmentStage);
        const stage = orderToTrack.shipmentStage || 'Ordered';

        const orderDate = new Date(orderToTrack.createdAt);
        const orderDateStr = orderDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
        
        const estDate = new Date(orderToTrack.estimatedDelivery || (orderDate.getTime() + 3 * 24 * 60 * 60 * 1000));
        const estDateStr = estDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

        let progress1 = 0;
        let progress2 = 0;
        let check1 = false;
        let check2 = false;
        let check3 = false;
        let statusText = "";

        if (stage === 'Ordered') {
            check1 = true;
            progress1 = 0;
            statusText = `Product is ordered and being processed at ${orderToTrack.shipmentHub || 'Bengaluru Fulfillment Hub'}.`;
        } else if (stage === 'Packed') {
            check1 = true;
            progress1 = 50;
            statusText = `Packed at ${orderToTrack.shipmentHub || 'Bengaluru Fulfillment Hub'}. Ready to be shipped.`;
        } else if (stage === 'Shipped') {
            check1 = true;
            check2 = true;
            progress1 = 100;
            progress2 = 30;
            statusText = `Today: Product has left the ${orderToTrack.shipmentHub || 'Bengaluru'} facility.`;
        } else if (stage === 'Out for Delivery') {
            check1 = true;
            check2 = true;
            progress1 = 100;
            progress2 = 80;
            statusText = `Out for Delivery: Package is out with courier associate from ${orderToTrack.courierPartner || 'LuxeMart Express'}.`;
        } else if (stage === 'Delivered') {
            check1 = true;
            check2 = true;
            check3 = true;
            progress1 = 100;
            progress2 = 100;
            statusText = `Delivered: Package was successfully handed over to the customer.`;
        }

        return (
            <div style={{ padding: '1.75rem', background: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '1.75rem', fontFamily: "'Inter', sans-serif" }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stage}</span>
                    {!isCancelled && (
                        <span style={{ background: '#10b981', color: '#ffffff', fontSize: '0.8rem', fontWeight: '700', padding: '0.3rem 0.8rem', borderRadius: '6px', textTransform: 'uppercase' }}>
                            On Time
                        </span>
                    )}
                </div>

                {/* Status Update Description */}
                <div style={{ fontSize: '0.95rem', color: '#475569', marginBottom: '2rem', lineHeight: '1.5' }}>
                    {isCancelled ? `Order Cancelled: ${orderToTrack.cancellationReason || 'Cancelled by customer'}` : statusText}
                </div>

                {!isCancelled && (
                    <div style={{ marginBottom: '2rem' }}>
                        {/* Responsive Timeline Stepper */}
                        <div className="tracking-timeline" style={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%', padding: '0 5%' }}>
                            
                            {/* Checkpoint 1 */}
                            <div className={`timeline-step ${check1 ? 'completed' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flexShrink: 0 }}>
                                <div className="timeline-circle" style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    borderRadius: '50%', 
                                    background: check1 ? '#10b981' : '#ffffff', 
                                    border: check1 ? 'none' : '2px solid #cbd5e1', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    {check1 && <Check size={14} style={{ color: '#ffffff', strokeWidth: 3 }} />}
                                </div>
                                <div className="timeline-content" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                    <div className="timeline-title" style={{ fontWeight: '700', color: check1 ? '#0f172a' : '#64748b', fontSize: '0.85rem' }}>Order Confirmed</div>
                                    <div className="timeline-date" style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>{orderDateStr}</div>
                                </div>
                            </div>
 
                            {/* Progress Line 1 */}
                            <div className="timeline-connector" style={{ flexGrow: 1, height: '4px', background: '#cbd5e1', position: 'relative', margin: '0 -2px', alignSelf: 'flex-start', marginTop: '10px' }}>
                                <div className="timeline-connector-bar" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress1}%`, background: '#10b981', transition: 'width 0.4s ease' }}></div>
                            </div>
 
                            {/* Checkpoint 2 */}
                            <div className={`timeline-step ${check2 ? 'completed' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flexShrink: 0 }}>
                                <div className="timeline-circle" style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    borderRadius: '50%', 
                                    background: check2 ? '#10b981' : '#ffffff', 
                                    border: check2 ? 'none' : '2px solid #cbd5e1', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    {check2 && <Check size={14} style={{ color: '#ffffff', strokeWidth: 3 }} />}
                                </div>
                                <div className="timeline-content" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                    <div className="timeline-title" style={{ fontWeight: '700', color: check2 ? '#0f172a' : '#64748b', fontSize: '0.85rem' }}>Shipped</div>
                                    <div className="timeline-date" style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                                        {check2 ? 'Today' : 'Processing'}
                                    </div>
                                </div>
                            </div>
 
                            {/* Progress Line 2 */}
                            <div className="timeline-connector" style={{ flexGrow: 1, height: '4px', background: '#cbd5e1', position: 'relative', margin: '0 -2px', alignSelf: 'flex-start', marginTop: '10px' }}>
                                <div className="timeline-connector-bar" style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress2}%`, background: '#10b981', transition: 'width 0.4s ease' }}></div>
                            </div>
 
                            {/* Checkpoint 3 */}
                            <div className={`timeline-step ${check3 ? 'completed' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flexShrink: 0 }}>
                                <div className="timeline-circle" style={{ 
                                    width: '24px', 
                                    height: '24px', 
                                    borderRadius: '50%', 
                                    background: check3 ? '#10b981' : '#ffffff', 
                                    border: check3 ? 'none' : '2px solid #cbd5e1', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center' 
                                }}>
                                    {check3 && <Check size={14} style={{ color: '#ffffff', strokeWidth: 3 }} />}
                                </div>
                                <div className="timeline-content" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                    <div className="timeline-title" style={{ fontWeight: '700', color: check3 ? '#0f172a' : '#64748b', fontSize: '0.85rem' }}>Delivery</div>
                                    <div className="timeline-date" style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                                        {check3 ? 'Delivered' : `${estDateStr} by 11 PM`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom info callout */}
                <div style={{ display: 'flex', gap: '0.75rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569' }}>
                    <span style={{ color: '#64748b' }}>ℹ️</span>
                    <div>
                        {stage === 'Out for Delivery' || stage === 'Delivered' 
                            ? `Delivery executive assigned via ${orderToTrack.courierPartner || 'LuxeMart Express'}. Contact details provided on callout.` 
                            : "Delivery Executive details will be available once the order is out for delivery"}
                    </div>
                </div>
            </div>
        );
    };

    const renderOrderDetailsModal = () => {
        if (!selectedOrder) return null;

        const datePlaced = new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
        const statusDetails = getStatusStyle(selectedOrder.shipmentStage);

        return (
            <div className="modal-overlay fade-in" style={{ position: 'fixed', inset: 0, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setSelectedOrder(null)}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', padding: '2.25rem', background: 'var(--bg-body)', position: 'relative' }} onClick={e => e.stopPropagation()}>
                    
                    {/* Header */}
                    <div className="flex justify-between items-start" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.45rem', fontWeight: '800' }}>Order Details</h2>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                Ordered on {datePlaced} | ID: #{selectedOrder._id}
                            </div>
                        </div>
                        <button 
                            style={{ background: 'none', border: 'none', fontSize: '1.75rem', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }} 
                            onClick={() => setSelectedOrder(null)}
                        >
                            &times;
                        </button>
                    </div>

                    {/* 1. Track Package Section at the very top area */}
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Truck size={18} /> Package Shipment Status
                    </h3>
                    {renderTrackingTimeline(selectedOrder)}

                    {/* Refund Information Banner (Conditional) */}
                    {['Refund Initiated', 'Refund Completed'].includes(selectedOrder.shipmentStage) && (
                        <div style={{ 
                            background: selectedOrder.shipmentStage === 'Refund Completed' ? 'rgba(20, 184, 166, 0.06)' : 'rgba(249, 115, 22, 0.06)', 
                            border: `1px solid ${statusDetails.color}`,
                            borderRadius: '8px', 
                            padding: '1.25rem', 
                            marginBottom: '1.75rem', 
                            display: 'flex', 
                            flexDirection: 'column',
                            gap: '0.35rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: statusDetails.color }}>
                                <RefreshCw size={16} /> Refund details ({selectedOrder.shipmentStage})
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                <strong>Refund Amount:</strong> {formatINR(selectedOrder.refundAmount || selectedOrder.totalPrice)}<br />
                                <strong>Refund Date:</strong> {selectedOrder.refundDate ? new Date(selectedOrder.refundDate).toLocaleString('en-IN') : 'Processing'}
                            </div>
                        </div>
                    )}

                    {/* 2. Grid for Addresses, Payment and Membership Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
                        
                        {/* Delivery Address */}
                        <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem', letterSpacing: '0.025em' }}>Delivery Address</h4>
                            <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                                <strong style={{ color: 'var(--text-main)' }}>{user.name}</strong><br />
                                {selectedOrder.shippingAddress.address}<br />
                                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}<br />
                                India
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem', letterSpacing: '0.025em' }}>Payment & Billing</h4>
                            <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                                <strong>Payment Method:</strong> {selectedOrder.paymentMethod}<br />
                                <strong>Status:</strong> {selectedOrder.isPaid ? 'Paid' : 'Pending'}<br />
                                <strong>Transaction ID:</strong><br />
                                <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                    {selectedOrder.paymentResult?.razorpayPaymentId || 'N/A (Cash on Delivery)'}
                                </span>
                            </div>
                        </div>

                        {/* Membership & Savings */}
                        <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <h4 style={{ fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.6rem', letterSpacing: '0.025em' }}>Luxe Membership</h4>
                            <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                                <strong>Tier Plan:</strong> {selectedOrder.membershipPlan || 'Basic'}<br />
                                <strong>Savings Applied:</strong> {selectedOrder.membershipSavings > 0 ? formatINR(selectedOrder.membershipSavings) : 'None'}<br />
                                {selectedOrder.membershipSavings > 0 ? (
                                    <span style={{ color: '#10b981', fontWeight: '700', fontSize: '0.75rem' }}>🎉 Free Delivery Active</span>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No active delivery waiver</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Items list */}
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.9rem' }}>Items Ordered</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1.75rem' }}>
                        {selectedOrder.orderItems.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center flex-wrap" style={{ paddingBottom: '1rem', borderBottom: idx !== selectedOrder.orderItems.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '4px', border: '1px solid var(--border-color)', overflow: 'hidden', background: '#fff', flexShrink: 0 }}>
                                    <ImageWithFallback src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <Link to={`/products/${item.product}`} className="hover:text-primary" style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.name}</Link>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Seller: LuxeMart Retail</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: '700' }}>{formatINR(item.price)}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qty: {item.qty}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 4. Action Buttons (Enhanced button spacing matching image 2) */}
                    <div className="flex justify-end" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1rem', gap: '0.75rem' }}>
                        <button 
                            className="btn btn-outline" 
                            style={{ 
                                padding: '0.75rem 1.75rem', 
                                fontSize: '0.95rem', 
                                fontWeight: '700',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                color: '#0f172a'
                            }} 
                            onClick={() => setSelectedOrder(null)}
                        >
                            Close
                        </button>
                        <Link 
                            to={`/invoice/${selectedOrder._id}`} 
                            className="btn btn-outline flex items-center gap-2"
                            style={{ 
                                padding: '0.75rem 1.75rem', 
                                fontSize: '0.95rem', 
                                fontWeight: '700',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#0f172a'
                            }}
                        >
                            <FileText size={16} /> View Invoice
                        </Link>
                        {['Ordered', 'Packed'].includes(selectedOrder.shipmentStage) && (
                            <button 
                                className="btn" 
                                style={{ 
                                    background: '#ef4444', 
                                    color: '#ffffff', 
                                    padding: '0.75rem 1.75rem', 
                                    fontSize: '0.95rem', 
                                    fontWeight: '700',
                                    borderRadius: '8px',
                                    border: 'none'
                                }} 
                                onClick={() => { setSelectedOrder(null); openCancelModal(selectedOrder._id); }}
                            >
                                Cancel Order
                            </button>
                        )}
                    </div>

                </div>
            </div>
        );
    };

    const renderCancelConfirmationModal = () => {
        if (!cancelModal.open) return null;
        return (
            <div className="modal-overlay" style={{ position: 'fixed', inset: 0, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '2rem', background: 'var(--bg-body)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--danger)' }}>Cancel Order?</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                        Are you sure you want to cancel Order #{cancelModal.orderId}? This will restore the items back into inventory stock.
                    </p>

                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Cancellation Reason</label>
                    <textarea 
                        className="input" 
                        placeholder="Please tell us why you are canceling..." 
                        rows="3" 
                        value={cancelModal.reason} 
                        onChange={(e) => setCancelModal({...cancelModal, reason: e.target.value})} 
                        style={{ marginBottom: '1.5rem', resize: 'none' }}
                        required
                    ></textarea>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button
                            className="btn btn-outline"
                            style={{ flex: 1, padding: '0.75rem 1rem' }}
                            onClick={() => setCancelModal({ open: false, orderId: null, reason: '' })}
                        >
                            No, Keep Order
                        </button>
                        <button
                            className="btn"
                            style={{ flex: 1, padding: '0.75rem 1rem', background: 'var(--danger)', color: '#ffffff' }}
                            onClick={submitCancellation}
                        >
                            Confirm Cancellation
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderFeedbackModal = () => {
        if (!feedbackModal.open) return null;
        return (
            <div className="modal-overlay fade-in" style={{ position: 'fixed', inset: 0, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setFeedbackModal({ open: false, orderId: null, seller: '', rating: 0, comment: '' })}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', background: 'var(--bg-body)' }} onClick={e => e.stopPropagation()}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Leave Seller Feedback</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Rate your experience with <strong>{feedbackModal.seller}</strong> for Order #{feedbackModal.orderId}</p>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={32} style={{ cursor: 'pointer', fill: star <= feedbackModal.rating ? 'var(--warning)' : 'none', color: star <= feedbackModal.rating ? 'var(--warning)' : 'var(--border-color)' }} onClick={() => setFeedbackModal({ ...feedbackModal, rating: star })} />
                        ))}
                    </div>

                    <textarea className="input" placeholder="What did you like or dislike?" rows="4" value={feedbackModal.comment} onChange={(e) => setFeedbackModal({...feedbackModal, comment: e.target.value})} style={{ marginBottom: '1.5rem', resize: 'none' }}></textarea>

                    <div className="flex gap-4">
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setFeedbackModal({ open: false, orderId: null, seller: '', rating: 0, comment: '' })}>Cancel</button>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={submitFeedback}>Submit Feedback</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderReviewModal = () => {
        if (!reviewModal.open) return null;
        return (
            <div className="modal-overlay fade-in" style={{ position: 'fixed', inset: 0, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }} onClick={() => setReviewModal({ open: false, item: null, rating: 0, title: '', comment: '' })}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', background: 'var(--bg-body)' }} onClick={e => e.stopPropagation()}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Write a Product Review</h2>
                    
                    <div className="flex gap-4 items-center" style={{ marginBottom: '2rem', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                        <img src={reviewModal.item.image} alt={reviewModal.item.name} loading="lazy" decoding="async" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                        <div style={{ fontWeight: '500', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{reviewModal.item.name}</div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={28} style={{ cursor: 'pointer', fill: star <= reviewModal.rating ? 'var(--warning)' : 'none', color: star <= reviewModal.rating ? 'var(--warning)' : 'var(--border-color)' }} onClick={() => setReviewModal({ ...reviewModal, rating: star })} />
                        ))}
                    </div>

                    <input type="text" className="input" placeholder="Add a headline" value={reviewModal.title} onChange={(e) => setReviewModal({...reviewModal, title: e.target.value})} style={{ marginBottom: '1rem' }} />
                    <textarea className="input" placeholder="Add a written review" rows="5" value={reviewModal.comment} onChange={(e) => setReviewModal({...reviewModal, comment: e.target.value})} style={{ marginBottom: '1.5rem', resize: 'vertical' }}></textarea>

                    <div className="flex gap-4">
                        <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setReviewModal({ open: false, item: null, rating: 0, title: '', comment: '' })}>Cancel</button>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={submitReview}>Submit Review</button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="fade-in container" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
                <div className="flex justify-between items-center flex-wrap gap-4" style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Your Orders</h1>
                    
                    <div className="search-bar-wrapper" style={{ maxWidth: '400px', width: '100%' }}>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input 
                                type="text" 
                                className="input" 
                                placeholder="Search by order ID or product name..." 
                                value={searchQuery}
                                onChange={handleSearch}
                                style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-full)' }}
                            />
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-6" style={{ marginBottom: '2.5rem', borderBottom: '2px solid var(--border-color)', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                    {['Orders', 'Buy Again', 'Not Yet Shipped', 'Cancelled Orders'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{ 
                                padding: '0.5rem 0', 
                                border: 'none',
                                background: 'none',
                                borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent', 
                                fontWeight: activeTab === tab ? '700' : '500', 
                                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)', 
                                whiteSpace: 'nowrap',
                                transition: 'var(--transition)',
                                cursor: 'pointer'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--text-muted)' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            border: '3px solid var(--border-color)',
                            borderTopColor: 'var(--primary)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 1rem'
                        }}></div>
                        Loading your orders...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <EmptyState 
                        icon={searchQuery ? Search : Package}
                        title={searchQuery ? "No matching orders found" : `No orders in ${activeTab}`}
                        description={searchQuery ? `We couldn't find any orders matching "${searchQuery}".` : "Looks like you haven't placed any orders matching this category."}
                        actionText="Continue Shopping"
                    />
                ) : (
                    <div className="flex-col" style={{ gap: '2rem' }}>
                        {filteredOrders.map(order => {
                            const datePlaced = new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
                            const itemsCount = order.orderItems.reduce((acc, curr) => acc + curr.qty, 0);
                            const statusDetails = getStatusStyle(order.shipmentStage);
                            const isOrderCancelled = ['Cancelled', 'Refund Initiated', 'Refund Completed'].includes(order.shipmentStage);

                            return (
                                <div key={order._id} className="glass-panel" style={{ overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                                    {/* Top metadata panel */}
                                    <div className="order-metadata-header" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', background: 'var(--bg-subtle)', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.25rem' }}>Order Placed</div>
                                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{datePlaced}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.25rem' }}>Total Amount</div>
                                            <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{formatINR(order.totalPrice)}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.25rem' }}>Ship To</div>
                                            <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{user.name}</div>
                                        </div>
                                        <div className="order-metadata-right" style={{ gridColumn: 'span 2 / auto', textAlign: 'right', minWidth: '180px' }}>
                                            <div style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: '700', marginBottom: '0.25rem' }}>Order # {order._id}</div>
                                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                                                <button 
                                                    onClick={() => setSelectedOrder(order)} 
                                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}
                                                >
                                                    <Eye size={14} /> View Details
                                                </button>
                                                <span style={{ color: 'var(--border-color)' }}>|</span>
                                                <Link to={`/invoice/${order._id}`} style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <FileText size={14} /> Invoice
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Card Content */}
                                    <div style={{ padding: '1.5rem' }}>
                                        
                                        {/* 1. Order Summary Card Block */}
                                        <div style={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            background: 'var(--bg-body)', 
                                            borderRadius: '8px', 
                                            padding: '1rem 1.25rem', 
                                            border: '1px solid var(--border-color)',
                                            marginBottom: '1.5rem',
                                            flexWrap: 'wrap',
                                            gap: '1rem'
                                        }}>
                                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                <div>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Order ID:</span>
                                                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>#{order._id.substring(12)}</div>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Placed:</span>
                                                    <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{datePlaced}</div>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Items:</span>
                                                    <div style={{ fontWeight: '700', fontSize: '0.9rem', textAlign: 'center' }}>{itemsCount}</div>
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amount:</span>
                                                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>{formatINR(order.totalPrice)}</div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
                                                <span style={{ 
                                                    padding: '0.3rem 0.8rem', 
                                                    borderRadius: '9999px', 
                                                    background: statusDetails.bg, 
                                                    color: statusDetails.color,
                                                    border: statusDetails.border,
                                                    fontSize: '0.8rem',
                                                    fontWeight: '700'
                                                }}>
                                                    {order.shipmentStage}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 2. Items list rendering with action buttons */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                            {order.orderItems.map((item, idx) => (
                                                <div key={idx} className="flex flex-wrap justify-between gap-6" style={{ paddingBottom: idx !== order.orderItems.length - 1 ? '1.5rem' : 0, borderBottom: idx !== order.orderItems.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                                    <div className="flex gap-4" style={{ flex: '1 1 300px' }}>
                                                        <div style={{ width: '90px', height: '90px', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden', flexShrink: 0, background: 'white', padding: '0.25rem' }}>
                                                            <ImageWithFallback src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                        </div>
                                                        <div>
                                                            <Link to={`/products/${item.product}`} className="hover:text-primary" style={{ fontWeight: '700', fontSize: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                                                                {item.name}
                                                            </Link>
                                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                                                                Seller: <span style={{ color: 'var(--primary)', fontWeight: '500' }}>LuxeMart Retail</span>
                                                            </div>
                                                            <div style={{ fontWeight: '700', marginTop: '0.5rem', color: 'var(--text-main)' }}>
                                                                {formatINR(item.price)} <span style={{ fontWeight: '400', fontSize: '0.8rem', color: 'var(--text-muted)' }}>x {item.qty}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions block on the right */}
                                                    <div className="order-actions-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '220px', justifyContent: 'center' }}>
                                                        <button 
                                                            className="btn btn-primary" 
                                                            onClick={() => handleReorder(item)}
                                                            style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                                        >
                                                            <ShoppingCart size={14} /> Buy Again
                                                        </button>
                                                        {/* Conditionally hide Track option if order is cancelled */}
                                                        <div style={{ display: 'grid', gridTemplateColumns: isOrderCancelled ? '1fr' : '1fr 1fr', gap: '0.5rem' }}>
                                                            {!isOrderCancelled && (
                                                                <button 
                                                                    className="btn btn-outline" 
                                                                    onClick={() => setSelectedOrder(order)}
                                                                    style={{ padding: '0.55rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                                                >
                                                                    <Truck size={12} /> Track
                                                                </button>
                                                            )}
                                                            <Link 
                                                                to={`/invoice/${order._id}`} 
                                                                className="btn btn-outline"
                                                                style={{ padding: '0.55rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                                            >
                                                                <FileText size={12} /> Invoice
                                                            </Link>
                                                        </div>
                                                        {!isOrderCancelled ? (
                                                            <button 
                                                                className="btn btn-outline" 
                                                                onClick={() => openCancelModal(order._id)}
                                                                style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--danger)', padding: '0.55rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                                            >
                                                                <XCircle size={14} /> Cancel Order
                                                            </button>
                                                        ) : (
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                                <button className="btn btn-outline" style={{ padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => setFeedbackModal({ open: true, orderId: order._id, seller: 'LuxeMart Retail', rating: 0, comment: '' })}>Feedback</button>
                                                                <button className="btn btn-outline" style={{ padding: '0.4rem', fontSize: '0.75rem' }} onClick={() => setReviewModal({ open: true, item: item, rating: 0, title: '', comment: '' })}>Review</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Custom Modals rendered outside relative containers for viewport-fixed correctness */}
            {renderOrderDetailsModal()}
            {renderCancelConfirmationModal()}
            {renderFeedbackModal()}
            {renderReviewModal()}
        </>
    );
};

export default Orders;
