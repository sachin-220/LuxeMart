import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { MapPin, CreditCard, CheckCircle, Package, Home, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
    const { user, token } = useContext(AuthContext);
    const { cart, cartTotal, clearCart } = useContext(CartContext);
    const navigate = useNavigate();

    const [address, setAddress] = useState({
        fullName: user?.name || '',
        street: '',
        city: '',
        state: '',
        zip: '',
        phone: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoDiscount, setPromoDiscount] = useState(0);

    const handleApplyPromo = () => {
        if (!promoCode.trim()) return;
        const code = promoCode.trim().toUpperCase();
        
        const promoCodes = {
            'ELECTRO20': { category: 'Electronics', percentage: 0.20 },
            'FASHION30': { category: 'Fashion', percentage: 0.30 },
            'FURNI15': { category: 'Furniture', percentage: 0.15 },
            'SHOES25': { category: 'Shoes', percentage: 0.25 },
            'WATCH10': { category: 'Watches', percentage: 0.10 },
            'DECOR20': { category: 'Home Decor', percentage: 0.20 },
            'GAMING10': { category: 'Gaming', percentage: 0.10 },
            'BEAUTY40': { category: 'Beauty', percentage: 0.40 },
            'LUXE10': { category: 'All', percentage: 0.10 }
        };

        const promo = promoCodes[code];
        if (promo) {
            let discountableAmount = 0;
            if (promo.category === 'All') {
                discountableAmount = cartTotal;
            } else {
                discountableAmount = cart.reduce((sum, item) => {
                    const itemCategory = item.category || '';
                    if (itemCategory.toLowerCase() === promo.category.toLowerCase()) {
                        return sum + (item.price * item.quantity);
                    }
                    return sum;
                }, 0);
            }

            if (discountableAmount > 0) {
                const discount = discountableAmount * promo.percentage;
                setPromoDiscount(discount);
                setPromoApplied(true);
                toast.success(`Promo code applied! ${promo.percentage * 100}% discount on ${promo.category} items.`);
            } else {
                toast.error(`This promo code is only valid for ${promo.category} items. Your cart doesn't have any.`);
                setPromoDiscount(0);
                setPromoApplied(false);
            }
        } else {
            toast.error("Invalid promo code");
            setPromoDiscount(0);
            setPromoApplied(false);
        }
    };

    // Auto-fill from Profile on mount
    React.useEffect(() => {
        if (user) {
            setAddress({
                fullName: user.name || '',
                street: user.address?.street || '',
                city: user.address?.city || '',
                state: user.address?.state || '',
                zip: user.address?.postalCode || '',
                phone: user.phoneNumber || ''
            });
        }
    }, [user]);

    const handleAutofill = (type) => {
        const addrSource = type === 'home' ? user?.homeAddress : type === 'work' ? user?.workAddress : user?.address;
        if (addrSource && addrSource.street) {
            setAddress({
                fullName: user?.name || '',
                street: addrSource.street || '',
                city: addrSource.city || '',
                state: addrSource.state || '',
                zip: addrSource.postalCode || '',
                phone: user?.phoneNumber || ''
            });
            toast.success(`Autofilled ${type} address!`);
        } else {
            toast.error(`No ${type} address saved in your profile yet.`);
        }
    };

    // If user is not logged in, they shouldn't normally be here due to our guards, but just in case:
    if (!user) {
        return (
            <div className="container empty-state fade-in">
                <h2>Please Sign In</h2>
                <p>You need to be signed in to checkout.</p>
                <button className="btn btn-primary" onClick={() => navigate('/signin')}>Sign In</button>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="container empty-state fade-in">
                <Package size={64} style={{ color: 'var(--border-color)', marginBottom: '1rem' }} />
                <h2>Your cart is empty</h2>
                <p>Add some items before proceeding to checkout.</p>
                <button className="btn btn-primary" onClick={() => navigate('/products')} style={{ marginTop: '1rem' }}>Browse Products</button>
            </div>
        );
    }

    const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    
    // Membership Logic
    const membershipPlan = localStorage.getItem('membershipPlan') || 'Basic';
    const isPremium = membershipPlan === 'Plus' || membershipPlan === 'Prime' || membershipPlan === 'Elite';
    
    const baseDelivery = 50;
    const delivery = isPremium ? 0 : (cartTotal > 499 ? 0 : baseDelivery); 
    const finalTotal = cartTotal + delivery - promoDiscount;
const hasOutOfStock = cart.some(item => item.stock <= 0);
    const estimatedTax = cartTotal * 0.18; 
    const membershipSavings = isPremium ? baseDelivery : 0;

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        
        if (!address.street || !address.city || !address.zip) {
            toast.error("Please complete your delivery address");
            return;
        }
        if (hasOutOfStock) {
            toast.error('Some items in your cart are out of stock. Please remove them before placing order.');
            return;
        }
        if (paymentMethod === 'card') {
            if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
                toast.error("Please fill in all credit card details");
                return;
            }
            if (cardDetails.number.replace(/\s/g, '').length < 15) { // Support Amex / normal cards (15-16 chars)
                toast.error("Please enter a valid card number");
                return;
            }
            if (cardDetails.expiry.length < 5) {
                toast.error("Please enter expiry in MM/YY format");
                return;
            }
            if (cardDetails.cvv.length < 3) {
                toast.error("Please enter a valid CVV");
                return;
            }
        }

        setIsPlacingOrder(true);
        
        try {
            // 1. Create order on backend
            const orderItems = cart.map(item => ({
                name: item.title,
                qty: item.quantity,
                image: item.image,
                price: item.price,
                product: item._id
            }));

            const res = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderItems,
                    shippingAddress: {
                        address: address.street,
                        city: address.city,
                        postalCode: address.zip,
                        country: 'India'
                    },
                    paymentMethod,
                    itemsPrice: cartTotal,
                    taxPrice: estimatedTax,
                    shippingPrice: delivery,
                    totalPrice: finalTotal,
                    membershipPlan,
                    membershipSavings
                })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.message);

            const { order, razorpayOrder } = data;

            // Direct checkout bypass for mock orders (demo/development) or Cash on Delivery (COD)
            // Direct checkout bypass for mock orders (demo/development) or Cash on Delivery (COD)
            if ((razorpayOrder && razorpayOrder.id && razorpayOrder.id.startsWith('order_mock_')) || paymentMethod === 'cod') {
                const verifyRes = await fetch(`http://localhost:5000/api/orders/${order._id}/pay`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        razorpay_order_id: razorpayOrder.id,
                        razorpay_payment_id: 'pay_mock_success',
                        razorpay_signature: 'mock_signature'
                    })
                });
                
                const verifyData = await verifyRes.json();
                if (verifyData.success) {
                    clearCart();
                    toast.success(paymentMethod === 'cod' ? "Order placed successfully (COD)!" : "Payment simulated successfully!");
                    navigate(`/payment-result?status=success&orderId=${verifyData.order._id}&txnId=${razorpayOrder.id}&amount=${verifyData.order.totalPrice}`);
                } else {
                    toast.error(verifyData.message || 'Payment verification failed');
                    navigate(`/payment-result?status=failure&orderId=${order._id}`);
                }
                setIsPlacingOrder(false);
                return;
            }

            // 2. Load Razorpay
            const resScript = await loadRazorpayScript();
            if (!resScript) {
                toast.error('Razorpay SDK failed to load. Are you offline?');
                setIsPlacingOrder(false);
                return;
            }

            // 3. Initialize Razorpay Modal
            const options = {
                key: 'rzp_test_placeholder', // Should Ideally come from backend API config
                amount: razorpayOrder.amount,
                currency: 'INR',
                name: 'LuxeMart',
                description: 'Premium Order Payment',
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch(`http://localhost:5000/api/orders/${order._id}/pay`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            clearCart();
                            toast.success("Payment successful!");
                            navigate(`/payment-result?status=success&orderId=${verifyData.order._id}&txnId=${response.razorpay_payment_id}&amount=${verifyData.order.totalPrice}`);
                        } else {
                            toast.error(verifyData.message || 'Payment verification failed');
                            navigate(`/payment-result?status=failure&orderId=${order._id}`);
                        }
                    } catch (err) {
                        toast.error(err.message);
                    }
                },
                prefill: {
                    name: address.fullName,
                    email: user.email,
                    contact: address.phone
                },
                theme: { color: '#4f46e5' },
                modal: {
                    ondismiss: function() {
                        toast.error("Payment cancelled by user");
                        navigate(`/payment-result?status=failure&orderId=${order._id}`);
                    }
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                toast.error(`Payment Failed: ${response.error.description}`);
                navigate(`/payment-result?status=failure&orderId=${order._id}`);
            });
            paymentObject.open();

        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to place order');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div className="fade-in">
            <h1 style={{ fontSize: '1.75rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                Secure Checkout
            </h1>

            <div className="marketplace-layout">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Delivery Address Section */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
                            <MapPin style={{ color: 'var(--primary)' }} />
                            Delivery Address
                        </div>

                        {/* Quick Address Autofill Selectors */}
                        <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: '500' }}>Autofill from saved profile addresses:</p>
                            <div className="flex gap-2 flex-wrap">
                                <button 
                                    type="button" 
                                    className="btn btn-outline" 
                                    onClick={() => handleAutofill('default')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                >
                                    <MapPin size={14} /> Default
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-outline" 
                                    onClick={() => handleAutofill('home')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                >
                                    <Home size={14} /> Home
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-outline" 
                                    onClick={() => handleAutofill('work')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                >
                                    <Briefcase size={14} /> Work
                                </button>
                            </div>
                        </div>

                        <form className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name</label>
                                <input type="text" className="input" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} required />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Street Address</label>
                                <input type="text" className="input" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} placeholder="House No, Building, Street" required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>City</label>
                                <input type="text" className="input" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>State</label>
                                <input type="text" className="input" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>ZIP / Postal Code</label>
                                <input type="text" className="input" value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Phone Number</label>
                                <input type="tel" className="input" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} required />
                            </div>
                        </form>
                    </div>

                    {/* Payment Method Section */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
                            <CreditCard style={{ color: 'var(--primary)' }} />
                            Payment Method
                        </div>
                        
                        <div className="flex-col gap-4">
                            <label className={`glass-panel flex items-center justify-between cursor-pointer ${paymentMethod === 'card' ? 'selected' : ''}`} style={{ padding: '1rem', border: paymentMethod === 'card' ? '2px solid var(--primary)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                <div className="flex items-center gap-3">
                                    <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} style={{ accentColor: 'var(--primary)' }} />
                                    <div style={{ fontWeight: '500' }}>Credit / Debit Card</div>
                                </div>
                                <div className="flex gap-2">
                                    <div style={{ width: '40px', height: '24px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#000', fontWeight: 'bold' }}>VISA</div>
                                    <div style={{ width: '40px', height: '24px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#000', fontWeight: 'bold' }}>MC</div>
                                </div>
                            </label>

                            {paymentMethod === 'card' && (
                                <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <input 
                                            type="text" 
                                            className="input" 
                                            placeholder="Card Number (16-digit)" 
                                            value={cardDetails.number}
                                            onChange={e => {
                                                const v = e.target.value.replace(/[^0-9]/g, '').substring(0, 16);
                                                const formatted = v.replace(/(\d{4})(?=\d)/g, '$1 ');
                                                setCardDetails({ ...cardDetails, number: formatted });
                                            }}
                                            maxLength={19}
                                        />
                                    </div>
                                    <div>
                                        <input 
                                            type="text" 
                                            className="input" 
                                            placeholder="MM/YY" 
                                            value={cardDetails.expiry}
                                            onChange={e => {
                                                const v = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
                                                const formatted = v.length > 2 ? `${v.substring(0, 2)}/${v.substring(2)}` : v;
                                                setCardDetails({ ...cardDetails, expiry: formatted });
                                            }}
                                            maxLength={5}
                                        />
                                    </div>
                                    <div>
                                        <input 
                                            type="password" 
                                            className="input" 
                                            placeholder="CVV" 
                                            value={cardDetails.cvv}
                                            onChange={e => {
                                                const v = e.target.value.replace(/[^0-9]/g, '').substring(0, 4);
                                                setCardDetails({ ...cardDetails, cvv: v });
                                            }}
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                            )}

                            <label className={`glass-panel flex items-center justify-between cursor-pointer ${paymentMethod === 'upi' ? 'selected' : ''}`} style={{ padding: '1rem', border: paymentMethod === 'upi' ? '2px solid var(--primary)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                <div className="flex items-center gap-3">
                                    <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} style={{ accentColor: 'var(--primary)' }} />
                                    <div style={{ fontWeight: '500' }}>UPI</div>
                                </div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>GPay, PhonePe, Paytm</div>
                            </label>
                            
                            <label className={`glass-panel flex items-center justify-between cursor-pointer ${paymentMethod === 'cod' ? 'selected' : ''}`} style={{ padding: '1rem', border: paymentMethod === 'cod' ? '2px solid var(--primary)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                <div className="flex items-center gap-3">
                                    <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} style={{ accentColor: 'var(--primary)' }} />
                                    <div style={{ fontWeight: '500' }}>Cash on Delivery</div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Order Summary Sticky Sidebar */}
                <div>
                    <div className="buy-box flex-col gap-4">
                        <div 
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                            style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}
                        >
                            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Order Summary</h3>
                            <div className="mobile-only" style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '700' }}>
                                Total: {formatINR(finalTotal)} <span style={{ fontSize: '0.75rem' }}>{isSummaryExpanded ? '▲' : '▼'}</span>
                            </div>
                        </div>
                        
                        <div className={`flex-col gap-4 ${!isSummaryExpanded ? 'checkout-summary-collapsed' : ''}`} style={{ marginTop: '0.5rem' }}>
                            <div className="flex-col gap-3" style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {cart.map(item => (
                                    <div key={item._id} className="flex gap-3" style={{ fontSize: '0.875rem' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', overflow: 'hidden', flexShrink: 0, background: 'white' }}>
                                            <img src={item.image} alt={item.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontWeight: '500' }}>{item.title}</div>
                                            <div style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Qty: {item.quantity} × {formatINR(item.price)}</div>
                                        </div>
                                        <div style={{ fontWeight: '600' }}>
                                            {formatINR(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex-col gap-2" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <div className="flex gap-2" style={{ marginBottom: '1rem' }}>
                                    <input 
                                        type="text" 
                                        className="input" 
                                        placeholder="Enter promo code (e.g. LUXE10)" 
                                        value={promoCode} 
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        disabled={promoApplied}
                                        style={{ flex: 1 }}
                                    />
                                    <button 
                                        className="btn btn-outline" 
                                        onClick={promoApplied ? () => { setPromoApplied(false); setPromoCode(''); setPromoDiscount(0); } : handleApplyPromo}
                                    >
                                        {promoApplied ? 'Remove' : 'Apply'}
                                    </button>
                                </div>
                                
                                <div className="flex justify-between" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <span>Items Total:</span>
                                    <span>{formatINR(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <span>Delivery Fee:</span>
                                    <span style={{ color: delivery === 0 ? 'var(--success)' : 'inherit' }}>
                                        {isPremium && <span style={{ textDecoration: 'line-through', marginRight: '0.5rem', color: 'var(--text-muted)' }}>{formatINR(baseDelivery)}</span>}
                                        {delivery === 0 ? 'FREE' : formatINR(delivery)}
                                    </span>
                                </div>
                                {isPremium && membershipSavings > 0 && (
                                    <div className="flex justify-between" style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                        <span>Luxe {membershipPlan} Savings:</span>
                                        <span>-{formatINR(membershipSavings)}</span>
                                    </div>
                                )}
                                {promoApplied && (
                                    <div className="flex justify-between" style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 'bold' }}>
                                        <span>Promo Discount:</span>
                                        <span>-{formatINR(promoDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <span>Estimated Tax (included):</span>
                                    <span>{formatINR(estimatedTax)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between" style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '1.25rem', fontWeight: '700' }}>
                            <span>Order Total:</span>
                            <span>{formatINR(finalTotal)}</span>
                        </div>

                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', marginTop: '1rem', borderRadius: 'var(--radius-full)', padding: '1rem', fontSize: '1.125rem' }}
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder}
                        >
                            {isPlacingOrder ? 'Processing...' : 'Place Order'}
                        </button>
                        
                        <div className="flex items-center justify-center gap-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            <CheckCircle size={12} style={{ color: 'var(--success)' }} />
                            <span>Safe and Secure Payments</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <style>{`
                @media (min-width: 1024px) {
                    .marketplace-layout { grid-template-columns: 1.5fr 1fr; gap: 2rem; }
                }
                @media (max-width: 768px) {
                    .checkout-summary-collapsed {
                        display: none !important;
                    }
                    .marketplace-layout {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                    }
                    form.grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Checkout;
