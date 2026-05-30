import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from './SkeletonLoader';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import { Crown, Clock, ChevronRight } from 'lucide-react';

const DeferredSections = ({ flashSale = [] }) => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const membershipPlan = localStorage.getItem('membershipPlan') || 'Basic';
  const isPremium = membershipPlan !== 'Basic';

  useEffect(() => {
    const getDeferredProducts = async () => {
      try {
        // Fetch recommended/featured products when this component mounts (enters viewport)
        const featuredData = await fetchProducts({ limit: 4 });
        setFeatured(featuredData.products || []);
      } catch (error) {
        console.error('Failed to fetch deferred products', error);
      } finally {
        setLoading(false);
      }
    };
    getDeferredProducts();
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {/* Recommended Products */}
        <m.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="flex justify-between items-center"
            style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--border-color)' }}
          >
            <h2 style={{ fontSize: '1.75rem', margin: 0 }}>Recommended For You</h2>
          </div>

          <div style={{ minHeight: '470px' }}>
            {loading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="product-grid">
                {featured.map(product => (
                  <ProductCard key={`rec-${product._id}`} product={product} />
                ))}
              </div>
            )}
          </div>
        </m.section>

        {/* Premium Member Deals */}
        {isPremium && (
          <m.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="flex justify-between items-center"
              style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--border-color)' }}
            >
              <div className="flex items-center gap-2">
                <Crown size={28} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                <h2 style={{ fontSize: '1.75rem', margin: 0 }}>Luxe {membershipPlan} Deals</h2>
              </div>
              <Link
                to="/products"
                className="flex items-center gap-1"
                style={{ color: 'var(--primary)', fontWeight: '600' }}
              >
                View Exclusives <ChevronRight size={18} />
              </Link>
            </div>

            <div style={{ minHeight: '470px' }}>
              {loading ? (
                <ProductGridSkeleton count={4} />
              ) : (
                <div className="product-grid">
                  {featured.slice(0, 4).reverse().map(product => (
                    <ProductCard key={`prem-${product._id}`} product={product} />
                  ))}
                </div>
              )}
            </div>
          </m.section>
        )}

        {/* Recently Viewed */}
        <m.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="flex justify-between items-center"
            style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--border-color)' }}
          >
            <div className="flex items-center gap-2">
              <Clock size={28} style={{ color: 'var(--text-muted)' }} />
              <h2 style={{ fontSize: '1.75rem', margin: 0 }}>Recently Viewed</h2>
            </div>
          </div>

          <div style={{ minHeight: '470px' }}>
            {loading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="product-grid">
                {flashSale.slice().reverse().map(product => (
                  <ProductCard key={`recent-${product._id}`} product={product} />
                ))}
              </div>
            )}
          </div>
        </m.section>

        {/* Promo Banner */}
        {!isPremium ? (
          <m.section
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'var(--primary)',
              color: 'white',
              padding: '3rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)'
            }}
            className="promo-banner-mobile"
          >
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>
              Join Premium Membership
            </h2>
            <p
              style={{
                fontSize: '1.25rem',
                opacity: 0.9,
                marginBottom: '2rem',
                maxWidth: '600px',
                margin: '0 auto 2rem'
              }}
            >
              Get free one-day delivery, exclusive discounts, and early access to sales.
            </p>
            <button
              onClick={() => navigate('/membership')}
              className="btn"
              style={{
                background: 'white',
                color: 'var(--primary)',
                padding: '1rem 3rem',
                fontSize: '1.125rem',
                borderRadius: 'var(--radius-full)'
              }}
            >
              Start Free Trial
            </button>
          </m.section>
        ) : (
          <m.section
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            style={{
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #1f2937 0%, #000000 100%)',
              color: '#fbbf24',
              padding: '3rem',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            className="promo-banner-mobile"
          >
            <Crown size={48} style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>
              Thank You, Luxe {membershipPlan} Member
            </h2>
            <p
              style={{
                fontSize: '1.25rem',
                opacity: 0.9,
                marginBottom: '2rem',
                maxWidth: '600px',
                margin: '0 auto 2rem',
                color: '#9ca3af'
              }}
            >
              You are enjoying our highest tier of benefits. Keep exploring to maximize your savings!
            </p>
            <button
              onClick={() => navigate('/membership')}
              className="btn"
              style={{
                background: '#fbbf24',
                color: 'black',
                padding: '1rem 3rem',
                fontSize: '1.125rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 'bold'
              }}
            >
              View Dashboard
            </button>
          </m.section>
        )}
      </div>
    </LazyMotion>
  );
};

export default DeferredSections;
