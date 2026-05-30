import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Github, Twitter, Linkedin, Facebook, Instagram, CreditCard, ShieldCheck, Truck } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-color)', marginTop: 'auto', paddingTop: '4rem' }}>
            {/* Features Strip */}
            <div className="container" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '3rem', marginBottom: '3rem' }}>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'center' }}>
                    <div className="flex-col items-center gap-2">
                        <Truck size={36} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                        <p style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Free & Fast Delivery</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Free shipping on all orders over $50</p>
                    </div>
                    <div className="flex-col items-center gap-2">
                        <ShieldCheck size={36} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                        <p style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Secure Payment</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>100% secure payment with 256-bit encryption</p>
                    </div>
                    <div className="flex-col items-center gap-2">
                        <Package size={36} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                        <p style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>Easy Returns</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>30 Days Return Policy</p>
                    </div>
                    <div className="flex-col items-center gap-2">
                        <CreditCard size={36} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                        <p style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>24/7 Support</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Dedicated support anytime, anywhere</p>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="container">
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                    <div className="flex-col gap-4" style={{ gridColumn: '1 / -1', maxWidth: '400px', marginBottom: '1rem' }}>
                        <div className="flex items-center gap-2" style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.5rem' }}>
                            <Package size={28} />
                            <span>LuxeMart</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)' }}>The premier marketplace for top-tier products, offering an unmatched shopping experience from start to finish.</p>
                        <div className="flex gap-4" style={{ marginTop: '1rem' }}>
                            <a href="#" className="btn-icon" aria-label="Facebook"><Facebook size={20} /></a>
                            <a href="#" className="btn-icon" aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="#" className="btn-icon" aria-label="Instagram"><Instagram size={20} /></a>
                            <a href="#" className="btn-icon" aria-label="LinkedIn"><Linkedin size={20} /></a>
                        </div>
                    </div>
                    
                    <div className="flex-col gap-2">
                        <p style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '700' }}>Get to Know Us</p>
                        <Link to="/membership" className="hover:text-primary" style={{ color: 'var(--text-muted)', padding: '0.25rem 0' }}>About LuxeMart</Link>
                        <Link to="/" className="hover:text-primary" style={{ color: 'var(--text-muted)', padding: '0.25rem 0' }}>Home</Link>
                    </div>
 
                    <div className="flex-col gap-2">
                        <p style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '700' }}>Shop with Us</p>
                        <Link to="/products" className="hover:text-primary" style={{ color: 'var(--text-muted)', padding: '0.25rem 0' }}>All Products</Link>
                        <Link to="/products?category=Electronics" className="hover:text-primary" style={{ color: 'var(--text-muted)', padding: '0.25rem 0' }}>Electronics</Link>
                        <Link to="/products?category=Fashion" className="hover:text-primary" style={{ color: 'var(--text-muted)', padding: '0.25rem 0' }}>Fashion</Link>
                        <Link to="/cart" className="hover:text-primary" style={{ color: 'var(--text-muted)', padding: '0.25rem 0' }}>Your Cart</Link>
                    </div>
 
                    <div className="flex-col gap-2">
                        <p style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '700' }}>Let Us Help You</p>
                        <Link to="/profile" className="hover:text-primary" style={{ color: 'var(--text-muted)', padding: '0.25rem 0' }}>Your Account</Link>
                        <Link to="/orders" className="hover:text-primary" style={{ color: 'var(--text-muted)', padding: '0.25rem 0' }}>Your Orders & Returns</Link>
                        <Link to="/membership" className="hover:text-primary" style={{ color: 'var(--text-muted)', padding: '0.25rem 0' }}>Luxe Membership Benefits</Link>
                    </div>
                </div>
                
                <div style={{ textAlign: 'center', padding: '2rem 0', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
                        <a href="#" className="hover:text-primary">Conditions of Use</a>
                        <a href="#" className="hover:text-primary">Privacy Notice</a>
                        <a href="#" className="hover:text-primary">Interest-Based Ads</a>
                    </div>
                    <p>&copy; {new Date().getFullYear()} LuxeMart, Inc. or its affiliates. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
