import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import HeroCarousel from '../components/HeroCarousel';
import { Smartphone, Shirt, MonitorPlay, Home as HomeIcon, Footprints, ChevronRight, Zap } from 'lucide-react';

const DeferredSections = lazy(() => import('../components/DeferredSections'));

const categories = [
    { name: 'Electronics', icon: <Smartphone size={24} />, color: '#3b82f6' },
    { name: 'Fashion', icon: <Shirt size={24} />, color: '#ec4899' },
    { name: 'Gaming', icon: <MonitorPlay size={24} />, color: '#8b5cf6' },
    { name: 'Home Decor', icon: <HomeIcon size={24} />, color: '#10b981' },
    { name: 'Shoes', icon: <Footprints size={24} />, color: '#ef4444' }
];

const LazySection = ({ children, fallback }) => {
    const [isIntersected, setIsIntersected] = useState(false);
    const ref = React.useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsIntersected(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return <div ref={ref} style={{ minHeight: '470px' }}>{isIntersected ? children : fallback}</div>;
};

const Home = () => {
    const [flashSale, setFlashSale] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const getProducts = async () => {
            try {
                // Fetch only flash sale products for immediate above-the-fold display
                const flashData = await fetchProducts({ limit: 4, page: 2 });
                setFlashSale(flashData.products || []);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };
        getProducts();
    }, []);

    return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* Category Icon Strip */}
            <div className="glass-panel category-strip" style={{ 
                padding: '1rem', 
                display: 'flex', 
                justifyContent: 'space-around', 
                overflowX: 'auto', 
                gap: '2rem',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                {categories.map((cat, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => navigate(`/products?category=${cat.name}`)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', minWidth: '80px' }}
                        className="group"
                    >
                        <div style={{ 
                            width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-body)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: cat.color,
                            boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s'
                        }} className="hover:scale-110">
                            {cat.icon}
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: '500', textAlign: 'center', color: 'var(--text-main)' }}>{cat.name}</span>
                    </div>
                ))}
            </div>

            {/* Hero Banner Carousel */}
            <HeroCarousel />

            {/* Flash Sale Section */}
            <section>
                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--border-color)' }}>
                    <div className="flex items-center gap-2">
                        <Zap size={28} style={{ color: 'var(--warning)', fill: 'var(--warning)' }} />
                        <h2 style={{ fontSize: '1.75rem', margin: 0 }}>Flash Sale</h2>
                    </div>
                    <Link to="/products" className="flex items-center gap-1" style={{ color: 'var(--primary)', fontWeight: '600' }}>
                        See All <ChevronRight size={18} />
                    </Link>
                </div>

                <div style={{ minHeight: '470px' }}>
                    {loading ? (
                        <ProductGridSkeleton count={4} />
                    ) : (
                        <div className="product-grid">
                            {flashSale.map(product => (
                                <ProductCard key={`flash-${product._id}`} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Deferred Below-the-fold Sections */}
            <LazySection fallback={<ProductGridSkeleton count={4} />}>
                <Suspense fallback={<ProductGridSkeleton count={4} />}>
                    <DeferredSections flashSale={flashSale} />
                </Suspense>
            </LazySection>

            <style>{`
                .category-strip::-webkit-scrollbar {
                    display: none;
                }
                @media (max-width: 768px) {
                    .category-strip {
                        justify-content: flex-start !important;
                        padding: 0.75rem !important;
                        gap: 1.25rem !important;
                    }
                    .category-strip > div {
                        min-width: 70px !important;
                    }
                    .category-strip > div > div {
                        width: 50px !important;
                        height: 50px !important;
                    }
                    .fade-in {
                        gap: 1.5rem !important;
                    }
                    section {
                        margin-bottom: 0.5rem;
                    }
                    section h2 {
                        font-size: 1.35rem !important;
                    }
                    section div.flex {
                        margin-bottom: 1rem !important;
                    }
                    section div.flex a {
                        font-size: 0.85rem !important;
                    }
                    .promo-banner-mobile {
                        padding: 2rem 1.5rem !important;
                    }
                    .promo-banner-mobile h2 {
                        font-size: 1.75rem !important;
                    }
                    .promo-banner-mobile p {
                        font-size: 1rem !important;
                        margin-bottom: 1.5rem !important;
                    }
                    .promo-banner-mobile button {
                        padding: 0.75rem 2rem !important;
                        font-size: 1rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;
