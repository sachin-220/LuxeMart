import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CartContext } from '../context/CartContext';
import { Trash2, Minus, Plus, ShoppingBag, ShieldCheck } from 'lucide-react';

import EmptyState from '../components/EmptyState';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useContext(CartContext);
    const navigate = useNavigate();

    const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

    if (cart.length === 0) {
        return (
            <div className="container" style={{ paddingBottom: '3rem' }}>
                <EmptyState 
                    icon={ShoppingBag}
                    title="Your Cart is Empty"
                    description="Looks like you haven't added anything to your cart yet."
                    actionText="Start Shopping"
                />
            </div>
        );
    }

    return (
        <div className="container fade-in">
            <h1 style={{ marginBottom: '2rem', fontSize: '2.5rem' }}>Shopping Cart</h1>
            
            <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '2rem', alignItems: 'start' }}>
                <div className="flex-col gap-4">
                    {cart.map(item => (
                        <div key={item._id} className="glass-panel flex" style={{ padding: '1.5rem', gap: '1.5rem', alignItems: 'center' }}>
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&q=80' }}
                                style={{ width: '100px', height: '100px', objectFit: 'contain', background: 'white', borderRadius: 'var(--radius-md)' }} 
                                loading="lazy"
                                decoding="async"
                            />
                            
                            <div className="flex-col justify-between" style={{ flexGrow: 1, height: '100px' }}>
                                <Link to={`/products/${item._id}`}>
                                    <h3 style={{ fontSize: '1.125rem', color: 'var(--text-main)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h3>
                                </Link>
                                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{formatINR(item.price)}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--success)' }}>In Stock</div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-4" style={{ background: 'var(--bg-body)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                                    <button onClick={() => updateQuantity(item._id, -1)} aria-label="Decrease quantity">
                                        <Minus size={16} />
                                    </button>
                                    <span style={{ fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item._id, 1)} aria-label="Increase quantity">
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button 
                                    className="btn-icon" 
                                    onClick={() => {
                                        removeFromCart(item._id);
                                        toast.success('Item removed from cart');
                                    }} 
                                    aria-label="Remove item" 
                                    style={{ color: '#ef4444' }}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass-panel flex-col gap-4" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
                    <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Order Summary</h2>
                    
                    <div className="flex justify-between" style={{ fontSize: '1.125rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Items ({cartCount}):</span>
                        <span style={{ fontWeight: '500' }}>{formatINR(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between" style={{ fontSize: '1.125rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Delivery Fee:</span>
                        <span style={{ fontWeight: '500', color: 'var(--success)' }}>Free Delivery</span>
                    </div>
                    <div className="flex justify-between" style={{ fontSize: '1.125rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Estimated Tax:</span>
                        <span style={{ fontWeight: '500' }}>{formatINR(cartTotal * 0.18)}</span>
                    </div>
                    
                    <div className="flex justify-between" style={{ fontSize: '1.5rem', fontWeight: '700', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                        <span>Order Total:</span>
                        <span>{formatINR(cartTotal * 1.18)}</span>
                    </div>
                    
                    <button onClick={() => navigate('/checkout')} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', marginTop: '1rem' }}>
                        Proceed to Buy
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        <ShieldCheck size={16} /> Safe and Secure Payments
                    </div>
                    
                    <button 
                        onClick={() => {
                            clearCart();
                            toast.success('Cart cleared');
                        }} 
                        className="btn btn-outline" 
                        style={{ width: '100%', color: '#ef4444', borderColor: '#ef4444', marginTop: '1rem' }}
                    >
                        Clear Cart
                    </button>
                </div>
            </div>

            {/* Mobile Sticky Checkout Bar */}
            <div className="mobile-only" style={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                background: 'var(--bg-nav)', 
                borderTop: '1px solid var(--border-color)', 
                padding: '0.75rem 1rem', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                zIndex: 90,
                boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
                paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))'
            }}>
                <div className="flex-col">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount</span>
                    <span style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)' }}>{formatINR(cartTotal * 1.18)}</span>
                </div>
                <button 
                    onClick={() => navigate('/checkout')}
                    className="btn btn-primary" 
                    style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem', margin: 0, borderRadius: 'var(--radius-md)', width: 'auto' }}
                >
                    Checkout
                </button>
            </div>

            {/* Make layout two columns on large screens */}
            <style>{`
                @media (min-width: 1024px) {
                    .grid { grid-template-columns: 2fr 1fr !important; }
                }
                @media (max-width: 768px) {
                    .glass-panel.flex {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }
                    .flex.items-center.gap-6 {
                        width: 100%;
                        justify-content: space-between;
                        margin-top: 1rem;
                    }
                    .flex.items-center.gap-4 {
                        padding: 0.65rem 1rem !important;
                    }
                    .flex.items-center.gap-4 button {
                        padding: 0.25rem 0.5rem;
                    }
                    .container {
                        padding-bottom: 7rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Cart;
