import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const CartDrawer = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isCartDrawerOpen, closeCartDrawer } = useContext(CartContext);
    const navigate = useNavigate();

    // Prevent body scroll when open
    useEffect(() => {
        if (isCartDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isCartDrawerOpen]);

    const handleCheckout = () => {
        closeCartDrawer();
        navigate('/checkout');
    };

    // INR Formatting
    const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    
    const delivery = cartTotal > 499 ? 0 : 50;

    return (
        <>
            <div 
                className={`cart-drawer-overlay ${isCartDrawerOpen ? 'open' : ''}`}
                onClick={closeCartDrawer}
                aria-label="Close cart"
            />
            
            <div className={`cart-drawer ${isCartDrawerOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                        <ShoppingBag size={24} /> 
                        Your Cart ({cartCount})
                    </h2>
                    <button className="btn-icon" onClick={closeCartDrawer} aria-label="Close cart drawer">
                        <X size={20} />
                    </button>
                </div>

                <div className="cart-body">
                    {cart.length === 0 ? (
                        <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                            <ShoppingBag size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                            <h3>Your cart is empty</h3>
                            <p style={{ marginTop: '0.5rem' }}>Looks like you haven't added anything yet.</p>
                            <button className="btn btn-primary" onClick={closeCartDrawer} style={{ marginTop: '1.5rem' }}>
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item._id} className="flex gap-4" style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                                <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&q=80' }}
                                    style={{ width: '80px', height: '80px', objectFit: 'contain', background: 'white', borderRadius: 'var(--radius-md)', padding: '0.5rem' }} 
                                    loading="lazy"
                                    decoding="async"
                                />
                                <div className="flex-col justify-between" style={{ flexGrow: 1 }}>
                                    <div className="flex justify-between items-start">
                                        <h4 style={{ fontSize: '0.875rem', fontWeight: '500', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', paddingRight: '1rem' }}>
                                            {item.title}
                                        </h4>
                                        <button 
                                            onClick={() => { removeFromCart(item._id); toast.success('Removed item'); }}
                                            style={{ color: 'var(--text-muted)', padding: '0.25rem' }}
                                            aria-label={`Remove ${item.title} from cart`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    
                                    <div className="flex justify-between items-center" style={{ marginTop: 'auto' }}>
                                        <div className="flex items-center gap-2" style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.25rem' }}>
                                            <button onClick={() => updateQuantity(item._id, -1)} style={{ padding: '0.25rem' }} aria-label="Decrease quantity"><Minus size={14} /></button>
                                            <span style={{ fontSize: '0.875rem', fontWeight: '600', minWidth: '1.5rem', textAlign: 'center' }} aria-label="Current quantity">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item._id, 1)} style={{ padding: '0.25rem' }} aria-label="Increase quantity"><Plus size={14} /></button>
                                        </div>
                                        <div style={{ fontWeight: '700' }}>
                                            {formatINR(item.price * item.quantity)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-footer flex-col gap-4">
                        <div className="flex justify-between" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            <span>Subtotal</span>
                            <span>{formatINR(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            <span>Shipping</span>
                            <span style={{ color: delivery === 0 ? 'var(--success)' : 'inherit' }}>{delivery === 0 ? 'Free Delivery' : formatINR(delivery)}</span>
                        </div>
                        <div className="flex justify-between items-center" style={{ fontSize: '1.25rem', fontWeight: '700', padding: '1rem 0', borderTop: '1px dashed var(--border-color)' }}>
                            <span>Total</span>
                            <span>{formatINR(cartTotal + delivery)}</span>
                        </div>
                        <button className="btn btn-primary" onClick={handleCheckout} style={{ width: '100%', padding: '1rem' }}>
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default React.memo(CartDrawer);
