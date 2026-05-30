import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Truck, MapPin, CreditCard, ChevronRight, Smartphone, DollarSign } from 'lucide-react';
import Confetti from 'react-confetti';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);

    useEffect(() => {
        if (location.state && location.state.orderId) {
            setOrderData(location.state);
        } else {
            // Redirect if accessed directly without state
            navigate('/products');
        }
    }, [location, navigate]);

    if (!orderData) return null;

    const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    
    // Calculate expected delivery correctly from state or fallback
    const expectedDeliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="container fade-in" style={{ padding: '3rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <Confetti 
                width={window.innerWidth} 
                height={window.innerHeight} 
                recycle={false} 
                numberOfPieces={200} 
            />
            <div className="glass-panel" style={{ padding: '3rem 2rem', borderTop: '6px solid var(--success)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', marginBottom: '1.5rem' }}>
                        <CheckCircle size={48} />
                    </div>
                    
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Order Placed Successfully!</h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                        Thank you for your purchase. We've received your order and are getting it ready.
                    </p>
                </div>

                <div className="order-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem', background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ wordBreak: 'break-all' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Order Number</div>
                        <div style={{ fontWeight: '700', fontSize: '1.0rem', fontFamily: 'monospace' }}>{orderData.orderId}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Date</div>
                        <div style={{ fontWeight: '600' }}>{new Date().toLocaleDateString()}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Amount</div>
                        <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--primary)' }}>{formatINR(orderData.total)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Payment Method</div>
                        <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {orderData.paymentMethod?.toLowerCase() === 'cod' ? (
                                <><DollarSign size={16} style={{ color: 'var(--success)' }} /> Cash on Delivery</>
                            ) : orderData.paymentMethod?.toLowerCase() === 'upi' ? (
                                <><Smartphone size={16} style={{ color: 'var(--primary)' }} /> UPI</>
                            ) : (
                                <><CreditCard size={16} style={{ color: 'var(--primary)' }} /> Credit / Debit Card</>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Truck size={20} className="text-primary" /> Delivery Estimate
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ background: 'var(--bg-body)', padding: '0.75rem', borderRadius: '50%', color: 'var(--primary)', boxShadow: 'var(--shadow-sm)' }}>
                            <MapPin size={24} />
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Arriving {expectedDeliveryDate}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Your items will be securely shipped via our premium delivery partners.</div>
                        </div>
                    </div>
                    
                    {/* Shipment Tracker visual */}
                    <div style={{ marginTop: '2rem', padding: '0 1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '1rem' }}>
                            <div style={{ position: 'absolute', top: '12px', left: '0', right: '0', height: '4px', background: 'var(--border-color)', zIndex: 0, borderRadius: '2px' }}></div>
                            <div style={{ position: 'absolute', top: '12px', left: '0', width: '25%', height: '4px', background: 'var(--success)', zIndex: 1, borderRadius: '2px' }}></div>
                            
                            {['Ordered', 'Packed', 'Shipped', 'Delivered'].map((step, idx) => (
                                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                                    <div style={{ 
                                        width: '28px', height: '28px', borderRadius: '50%', 
                                        background: idx === 0 ? 'var(--success)' : 'var(--bg-body)',
                                        border: idx === 0 ? 'none' : '4px solid var(--border-color)',
                                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        marginBottom: '0.5rem', boxShadow: idx === 0 ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none'
                                    }}>
                                        {idx === 0 && <CheckCircle size={16} />}
                                    </div>
                                    <span style={{ fontSize: '0.875rem', fontWeight: idx === 0 ? '600' : '500', color: idx === 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                        {step}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4 flex-wrap" style={{ marginTop: '2rem' }}>
                    <Link to="/orders" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
                        <Package size={18} /> View Orders
                    </Link>
                    <Link to="/products" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
                        Continue Shopping <ChevronRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
