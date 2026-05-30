import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Crown, Gift, Truck } from 'lucide-react';
import Confetti from 'react-confetti';

const MembershipSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const planName = location.state?.planName || localStorage.getItem('membershipPlan') || 'Plus';

    useEffect(() => {
        window.scrollTo(0, 0);
        // If they somehow navigated here without state, push them to dashboard after 5s
        const timer = setTimeout(() => {
            navigate('/membership');
        }, 8000);
        
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="fade-in flex flex-col items-center justify-center" style={{ minHeight: '60vh', textAlign: 'center', padding: '2rem' }}>
            <Confetti 
                width={window.innerWidth} 
                height={window.innerHeight} 
                recycle={false} 
                numberOfPieces={200} 
            />
            <div style={{ 
                width: '100px', height: '100px', 
                borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 2rem',
                color: 'var(--success)',
                animation: 'bounceIn 0.8s ease'
            }}>
                <CheckCircle size={50} />
            </div>

            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
                Welcome to <span style={{ color: planName === 'Elite' ? '#fbbf24' : 'var(--primary)' }}>Luxe {planName}</span>!
            </h1>
            
            <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem' }}>
                Your payment was successful. Your premium benefits have been activated immediately.
            </p>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '800px', margin: '0 auto 3rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Truck size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                    <h3 style={{ fontWeight: 'bold' }}>Free Delivery</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Automatically applied at checkout</p>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Gift size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                    <h3 style={{ fontWeight: 'bold' }}>Early Access</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Shop sales 24hrs before everyone</p>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <Crown size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                    <h3 style={{ fontWeight: 'bold' }}>Premium Deals</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Unlock member-only pricing</p>
                </div>
            </div>

            <Link to="/membership" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.125rem', borderRadius: 'var(--radius-full)' }}>
                Go to Membership Dashboard
            </Link>
        </div>
    );
};

export default MembershipSuccess;
