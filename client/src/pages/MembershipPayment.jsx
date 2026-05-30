import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, Wallet, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MembershipPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { planName, price } = location.state || { planName: 'Plus', price: '₹999' };
    
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isProcessing, setIsProcessing] = useState(false);

    // In a real app, price should be parsed properly, but for this fake flow we just strip non-numeric
    const numericPrice = price === 'Free' ? 0 : parseInt(price.replace(/[^\d]/g, ''), 10);
    const total = numericPrice;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handlePayment = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        
        // Simulate network request
        setTimeout(() => {
            const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString();
            localStorage.setItem('membershipPlan', planName);
            localStorage.setItem('membershipRenewal', nextYear);
            
            navigate('/membership-success', { state: { planName } });
        }, 2000);
    };

    return (
        <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Lock size={24} style={{ color: 'var(--success)' }} /> Secure Checkout
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Complete your payment to unlock Luxe {planName} benefits.</p>
            </div>

            <div className="grid membership-payment-grid" style={{ gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'flex-start' }}>
                
                {/* Payment Form */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        Select Payment Method
                    </h2>
                    
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <div 
                            onClick={() => setPaymentMethod('card')}
                            style={{ flex: 1, padding: '1rem', border: `2px solid ${paymentMethod === 'card' ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center', background: paymentMethod === 'card' ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}
                        >
                            <CreditCard size={24} style={{ margin: '0 auto 0.5rem', color: paymentMethod === 'card' ? 'var(--primary)' : 'var(--text-muted)' }} />
                            <div style={{ fontWeight: '600' }}>Credit / Debit Card</div>
                        </div>
                        <div 
                            onClick={() => setPaymentMethod('upi')}
                            style={{ flex: 1, padding: '1rem', border: `2px solid ${paymentMethod === 'upi' ? 'var(--primary)' : 'var(--border-color)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center', background: paymentMethod === 'upi' ? 'rgba(99, 102, 241, 0.05)' : 'transparent' }}
                        >
                            <Wallet size={24} style={{ margin: '0 auto 0.5rem', color: paymentMethod === 'upi' ? 'var(--primary)' : 'var(--text-muted)' }} />
                            <div style={{ fontWeight: '600' }}>UPI App</div>
                        </div>
                    </div>

                    <form onSubmit={handlePayment}>
                        {paymentMethod === 'card' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
                                <div className="form-group">
                                    <label>Card Number</label>
                                    <input type="text" className="input" placeholder="0000 0000 0000 0000" maxLength="19" required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Expiry Date</label>
                                        <input type="text" className="input" placeholder="MM/YY" maxLength="5" required />
                                    </div>
                                    <div className="form-group">
                                        <label>CVV</label>
                                        <input type="password" className="input" placeholder="123" maxLength="3" required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Name on Card</label>
                                    <input type="text" className="input" placeholder="John Doe" required />
                                </div>
                            </div>
                        )}
                        
                        {paymentMethod === 'upi' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
                                <div className="form-group">
                                    <label>Enter UPI ID</label>
                                    <input type="text" className="input" placeholder="username@upi" required />
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>A payment request will be sent to your UPI app.</div>
                                </div>
                            </div>
                        )}

                        <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '1.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <ShieldCheck size={20} style={{ flexShrink: 0 }} />
                            <div>
                                <strong>Cash on Delivery is not available for digital subscriptions.</strong> Please use a prepaid method.
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={isProcessing}
                            style={{ width: '100%', padding: '1rem', marginTop: '2rem', fontSize: '1.125rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {isProcessing ? 'Processing Payment...' : `Pay ₹${total.toLocaleString('en-IN')}`}
                        </button>
                    </form>
                    
                    <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                        <Lock size={12} /> Payments are 100% secure and encrypted.
                    </div>
                </div>

                {/* Order Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.125rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                            Subscription Summary
                        </h2>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: '600' }}>
                            <span>Luxe {planName} (1 Year)</span>
                            <span>₹{numericPrice.toLocaleString('en-IN')}</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            <span>Estimated Tax</span>
                            <span>Included</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '1.25rem', fontWeight: '800' }}>
                            <span>Total</span>
                            <span>₹{total.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                    
                    <div className="glass-panel" style={{ padding: '1rem', background: 'var(--bg-body)' }}>
                        <h3 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Benefits Unlocking:</h3>
                        <ul style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Unlimited Free Delivery</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Early Sale Access</li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> Premium Exclusive Deals</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MembershipPayment;
