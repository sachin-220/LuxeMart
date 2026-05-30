import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Star, Truck, MonitorPlay, Zap, ShieldCheck, CreditCard, Gift, Clock, Crown, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { OrderContext } from '../context/OrderContext';
import toast from 'react-hot-toast';

const Membership = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [currentPlan, setCurrentPlan] = useState('Basic');
    const [renewalDate, setRenewalDate] = useState(null);
    const [isDashboard, setIsDashboard] = useState(false);
    
    const [savedDelivery, setSavedDelivery] = useState(0);
    const [cashback, setCashback] = useState(0);
    const [exclusiveDeals, setExclusiveDeals] = useState(0);
    
    const { orders, fetchOrders } = useContext(OrderContext);

    useEffect(() => {
        const savedPlan = localStorage.getItem('membershipPlan');
        const savedDate = localStorage.getItem('membershipRenewal');
        
        if (savedPlan && savedPlan !== 'Basic') {
            setCurrentPlan(savedPlan);
            setRenewalDate(savedDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString());
            setIsDashboard(true);
            fetchOrders();
        }
    }, [fetchOrders]);

    useEffect(() => {
        if (isDashboard && orders.length > 0) {
            let totalSpent = 0;
            orders.forEach(o => {
                if (o.shipmentStage !== 'Cancelled') {
                    totalSpent += o.totalPrice;
                }
            });
            
            // Delivery saved: assuming ₹50 per order
            const validOrders = orders.filter(o => o.shipmentStage !== 'Cancelled');
            setSavedDelivery(validOrders.length * 50);
            
            // Cashback: 5% for Prime, 10% for Elite
            let cashbackRate = 0;
            if (currentPlan === 'Prime') cashbackRate = 0.05;
            if (currentPlan === 'Elite') cashbackRate = 0.10;
            setCashback(Math.floor(totalSpent * cashbackRate));
            
            // Exclusive deals claimed
            setExclusiveDeals(validOrders.length);
        }
    }, [orders, isDashboard, currentPlan]);

    const handleSubscribe = (planName, price) => {
        if (!user) {
            toast.error("Please sign in to subscribe to LuxeMart Premium.");
            navigate('/signin');
            return;
        }
        
        // Instead of instantly activating, push to the fake payment gateway
        navigate('/membership-payment', { state: { planName, price } });
    };

    const handleCancel = () => {
        if(window.confirm("Are you sure you want to cancel your Premium benefits?")) {
            localStorage.setItem('membershipPlan', 'Basic');
            localStorage.removeItem('membershipRenewal');
            setCurrentPlan('Basic');
            setIsDashboard(false);
            toast.success("Membership cancelled. You are now on the Basic plan.");
        }
    };

    const tiers = [
        {
            name: 'Basic',
            price: 'Free',
            period: 'Forever',
            color: '#94a3b8',
            gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            textColor: '#0f172a',
            benefits: ['Standard Delivery (3-5 days)', '30-Day Returns', 'Standard Support']
        },
        {
            name: 'Plus',
            price: '₹999',
            period: '/year',
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%)',
            textColor: '#1e3a8a',
            benefits: ['Free One-Day Delivery', '60-Day Returns', 'Early Sale Access', 'Luxe Video Basic']
        },
        {
            name: 'Prime',
            price: '₹1,999',
            period: '/year',
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)',
            textColor: 'white',
            badge: 'MOST POPULAR',
            benefits: ['Free Express Delivery', 'Premium Deals', '5% Cashback on everything', 'Luxe Video Premium', 'Priority Support']
        },
        {
            name: 'Elite',
            price: '₹4,999',
            period: '/year',
            color: '#111827',
            gradient: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)',
            textColor: '#fbbf24',
            badge: 'LUXURY TIER',
            benefits: ['Same-Day VIP Delivery', 'Exclusive Elite Products', '10% Cashback on everything', '24/7 Dedicated Concierge', 'VIP Event Invites']
        }
    ];

    return (
        <div className="fade-in">
            {/* Dashboard View */}
            {isDashboard ? (
                <div className="container" style={{ marginBottom: '4rem' }}>
                    <div className="membership-dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.name.split(' ')[0]}</span>
                            </h1>
                            <p style={{ color: 'var(--text-muted)' }}>Manage your LuxeMart Premium benefits</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: currentPlan === 'Prime' ? '#7c3aed' : currentPlan === 'Elite' ? '#000' : '#3b82f6', color: currentPlan === 'Elite' ? '#fbbf24' : 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 'bold' }}>
                                <Crown size={16} /> Luxe {currentPlan} Active
                            </div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Renews on: {renewalDate}</div>
                        </div>
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Truck size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{savedDelivery.toLocaleString('en-IN')}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Saved on Delivery</div>
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{cashback.toLocaleString('en-IN')}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Cashback Earned</div>
                            </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Gift size={24} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{exclusiveDeals}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Premium Orders Placed</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                        <button onClick={handleCancel} className="btn" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>Cancel Membership</button>
                    </div>
                </div>
            ) : (
                /* Non-Subscribed Hero */
                <section style={{ 
                    borderRadius: 'var(--radius-lg)', 
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    color: 'white',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                    marginBottom: '4rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', background: 'rgba(99, 102, 241, 0.2)', filter: 'blur(80px)', borderRadius: '50%' }}></div>
                    <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '300px', height: '300px', background: 'rgba(139, 92, 246, 0.2)', filter: 'blur(80px)', borderRadius: '50%' }}></div>
                    
                    <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', marginBottom: '1.5rem', backdropFilter: 'blur(4px)' }}>
                            <Star size={16} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                            <span style={{ fontSize: '0.875rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>LuxeMart Premium Ecosystem</span>
                        </div>
                        
                        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '1.5rem', lineHeight: '1.2' }}>
                            The Ultimate Shopping Experience
                        </h1>
                        <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '2.5rem' }}>
                            Unlock free express delivery, massive cashback rewards, and exclusive VIP deals with our new tiered membership ecosystem.
                        </p>
                    </div>
                </section>
            )}

            {/* Pricing Tiers Section */}
            <section style={{ marginBottom: '5rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{isDashboard ? 'Upgrade Your Experience' : 'Choose Your Tier'}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto' }}>
                        From unlimited free shipping to dedicated VIP concierge, find the plan that fits your shopping lifestyle.
                    </p>
                </div>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
                    {tiers.map((tier, idx) => {
                        const isCurrent = currentPlan === tier.name;
                        
                        return (
                            <div key={idx} className="membership-tier-card" style={{ 
                                background: tier.gradient,
                                color: tier.textColor,
                                padding: '2.5rem 2rem',
                                borderRadius: 'var(--radius-lg)',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: tier.badge ? '0 20px 40px rgba(0,0,0,0.2)' : 'var(--shadow-md)',
                                transform: tier.badge ? 'scale(1.05)' : 'none',
                                zIndex: tier.badge ? 10 : 1,
                                border: isCurrent ? '3px solid #10b981' : 'none',
                                transition: 'transform 0.3s ease'
                            }}>
                                {isCurrent && (
                                    <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '0.25rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Check size={14} /> ACTIVE PLAN
                                    </div>
                                )}
                                {tier.badge && !isCurrent && (
                                    <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: tier.name === 'Elite' ? '#fbbf24' : 'var(--primary)', color: tier.name === 'Elite' ? 'black' : 'white', padding: '0.25rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                        {tier.badge}
                                    </div>
                                )}

                                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: '800' }}>{tier.name}</h3>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '2rem' }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>{tier.price}</span>
                                    {tier.period && <span style={{ opacity: 0.8 }}>{tier.period}</span>}
                                </div>

                                <ul style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                    {tier.benefits.map((ben, i) => (
                                        <li key={i} className="flex items-center gap-2" style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                                            <Check size={18} style={{ opacity: 0.8 }} /> {ben}
                                        </li>
                                    ))}
                                </ul>

                                {isCurrent ? (
                                    <button disabled className="btn" style={{ background: 'rgba(0,0,0,0.1)', color: 'inherit', width: '100%', cursor: 'not-allowed' }}>Current Plan</button>
                                ) : (
                                    tier.name === 'Basic' ? null : (
                                        <button 
                                            onClick={() => handleSubscribe(tier.name, tier.price)}
                                            className="btn" 
                                            style={{ 
                                                background: tier.name === 'Elite' ? '#fbbf24' : tier.textColor === 'white' ? 'white' : 'var(--primary)', 
                                                color: tier.name === 'Elite' ? 'black' : tier.textColor === 'white' ? 'var(--primary)' : 'white', 
                                                width: '100%',
                                                fontWeight: 'bold',
                                                boxShadow: 'var(--shadow-md)'
                                            }}
                                        >
                                            Upgrade to {tier.name}
                                        </button>
                                    )
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
};

export default Membership;
