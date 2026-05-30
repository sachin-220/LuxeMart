import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, Star, ChevronDown, Search, X } from 'lucide-react';
import { m, LazyMotion, domAnimation } from 'framer-motion';
import EmptyState from '../components/EmptyState';
import { useScreenSize } from '../hooks/useMediaQuery';

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const categories = ['All', 'Electronics', 'Fashion', 'Shoes', 'Watches', 'Home Decor', 'Gaming', 'Mobiles', 'Laptops', 'Headphones', 'Furniture', 'Beauty', 'Sports'];
const ratings = [4, 3, 2, 1];

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [totalProducts, setTotalProducts] = useState(0);
    
    const { isMobile, isTablet } = useScreenSize();
    const limit = isMobile ? 12 : isTablet ? 18 : 24;
    
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    
    const category = queryParams.get('category') || 'All';
    const search = queryParams.get('search') || '';

    // Mock filtering state
    const [priceRange, setPriceRange] = useState(150000);
    const [localPriceRange, setLocalPriceRange] = useState(150000);
    const [selectedRating, setSelectedRating] = useState(0);

    const prevFiltersRef = useRef({ category, search, priceRange, selectedRating });

    // Sync local price range when parent price range changes (e.g. from clear filters)
    useEffect(() => {
        setLocalPriceRange(priceRange);
    }, [priceRange]);

    const debouncedSetPriceRange = useCallback(
        debounce((val) => setPriceRange(val), 300),
        []
    );

    const handlePriceSliderChange = (val) => {
        setLocalPriceRange(val);
        debouncedSetPriceRange(val);
    };

    useEffect(() => {
        const filtersChanged = 
            prevFiltersRef.current.category !== category ||
            prevFiltersRef.current.search !== search ||
            prevFiltersRef.current.priceRange !== priceRange ||
            prevFiltersRef.current.selectedRating !== selectedRating;

        if (filtersChanged) {
            prevFiltersRef.current = { category, search, priceRange, selectedRating };
            if (page !== 1) {
                setPage(1);
                return; // Stop here; the page state change will trigger the next effect run
            }
        }

        const getProducts = async () => {
            if (page === 1) setLoading(true);
            else setLoadingMore(true);
            
            try {
                const params = { 
                    limit, 
                    page,
                    maxPrice: priceRange < 150000 ? priceRange : undefined,
                    minRating: selectedRating > 0 ? selectedRating : undefined
                };
                if (category !== 'All') params.category = category;
                if (search) params.search = search;
                
                const data = await fetchProducts(params);
                
                if (page === 1) {
                    setProducts(data.products || []);
                } else {
                    setProducts(prev => [...prev, ...(data.products || [])]);
                }
                
                setHasMore(data.currentPage < data.totalPages);
                setTotalProducts(data.total || 0);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        };
        
        const timer = setTimeout(() => {
            getProducts();
        }, 300);
        
        return () => clearTimeout(timer);
    }, [category, search, priceRange, selectedRating, page, limit]);

    const handleCategory = (cat) => {
        const newParams = new URLSearchParams(location.search);
        if (cat !== 'All') {
            newParams.set('category', cat);
        } else {
            newParams.delete('category');
        }
        navigate(`?${newParams.toString()}`);
    };

    const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

    return (
        <LazyMotion features={domAnimation}>
            <div className="fade-in">
                <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                        {search ? `Search results for "${search}"` : category !== 'All' ? `${category}` : 'All Products'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Showing {products.length} of {totalProducts} results</p>
                </div> 
                <button 
                    className="mobile-only btn btn-outline"
                    style={{ width: '100%', marginBottom: '1.5rem', padding: '0.85rem', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', borderRadius: 'var(--radius-md)' }}
                    onClick={() => setIsMobileFiltersOpen(true)}
            >
                <Filter size={18} /> Filters & Sorting
            </button>

            {/* Mobile Filter Drawer Overlay & Drawer Container */}
            <div className={`mobile-only mobile-filter-drawer-overlay ${isMobileFiltersOpen ? 'open' : ''}`} onClick={() => setIsMobileFiltersOpen(false)}>
                <div className={`mobile-filter-drawer ${isMobileFiltersOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
                    <div className="mobile-filter-header">
                        <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Filters & Sorting</span>
                        <button type="button" onClick={() => setIsMobileFiltersOpen(false)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Close filters">
                            <X size={22} />
                        </button>
                    </div>
                    <div className="mobile-filter-body">
                        <div className="filter-group">
                            <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Categories</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                {categories.map(cat => (
                                    <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: category === cat ? 'var(--primary)' : 'var(--text-main)', fontWeight: category === cat ? '600' : '400' }}>
                                        <input 
                                            type="radio" 
                                            name="mobile-category"
                                            checked={category === cat}
                                            onChange={() => handleCategory(cat)}
                                            style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                                        />
                                        {cat}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Price Range</h3>
                            <input 
                                type="range" 
                                min="0" 
                                max="150000" 
                                step="1000"
                                value={localPriceRange} 
                                onChange={(e) => handlePriceSliderChange(Number(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--primary)' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                <span>₹0</span>
                                <span>Up to {formatINR(localPriceRange)}</span>
                            </div>
                        </div>

                        <div className="filter-group">
                            <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Customer Reviews</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    <input 
                                        type="radio" 
                                        name="mobile-rating"
                                        checked={selectedRating === 0}
                                        onChange={() => setSelectedRating(0)}
                                        style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                                    />
                                    All Ratings
                                </label>
                                {ratings.map(rating => (
                                    <label key={rating} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                        <input 
                                            type="radio" 
                                            name="mobile-rating"
                                            checked={selectedRating === rating}
                                            onChange={() => setSelectedRating(rating)}
                                            style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                                        />
                                        <span style={{ display: 'flex', alignItems: 'center', color: 'var(--warning)' }}>
                                            {Array(rating).fill(0).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                            {Array(5 - rating).fill(0).map((_, i) => <Star key={`empty-${i}`} size={14} />)}
                                            <span style={{ color: 'var(--text-main)', marginLeft: '0.25rem' }}>& Up</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mobile-filter-footer">
                        <button 
                            type="button" 
                            className="btn btn-outline" 
                            style={{ padding: '0.75rem' }}
                            onClick={() => {
                                setPriceRange(150000);
                                setLocalPriceRange(150000);
                                setSelectedRating(0);
                                handleCategory('All');
                            }}
                        >
                            Reset
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            style={{ padding: '0.75rem' }}
                            onClick={() => setIsMobileFiltersOpen(false)}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            <div className="marketplace-layout">
                {/* Desktop Sidebar */}
                <aside className="sidebar desktop-only" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="filter-group">
                        <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Categories</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {categories.map(cat => (
                                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: category === cat ? 'var(--primary)' : 'var(--text-main)', fontWeight: category === cat ? '600' : '400' }}>
                                    <input 
                                        type="radio" 
                                        name="category"
                                        checked={category === cat}
                                        onChange={() => handleCategory(cat)}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    {cat}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Price Range</h3>
                        <input 
                            type="range" 
                            min="0" 
                            max="150000" 
                            step="1000"
                            value={localPriceRange} 
                            onChange={(e) => handlePriceSliderChange(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary)' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            <span>₹0</span>
                            <span>Up to {formatINR(localPriceRange)}</span>
                        </div>
                    </div>

                    <div className="filter-group">
                        <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Customer Reviews</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                                <input 
                                    type="radio" 
                                    name="rating"
                                    checked={selectedRating === 0}
                                    onChange={() => setSelectedRating(0)}
                                    style={{ accentColor: 'var(--primary)' }}
                                />
                                All Ratings
                            </label>
                            {ratings.map(rating => (
                                <label key={rating} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                                    <input 
                                        type="radio" 
                                        name="rating"
                                        checked={selectedRating === rating}
                                        onChange={() => setSelectedRating(rating)}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    <span style={{ display: 'flex', alignItems: 'center', color: 'var(--warning)' }}>
                                        {Array(rating).fill(0).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                        {Array(5 - rating).fill(0).map((_, i) => <Star key={`empty-${i}`} size={14} />)}
                                        <span style={{ color: 'var(--text-main)', marginLeft: '0.25rem' }}>& Up</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                <div style={{ minWidth: 0, minHeight: '600px' }}>
                    {loading ? (
                        <ProductGridSkeleton count={8} />
                    ) : products.length > 0 ? (
                        <>
                            <m.div 
                                className="product-grid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                {products.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                                {loadingMore && <ProductGridSkeleton count={4} />}
                            </m.div>
                            {hasMore && !loadingMore && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                                    <button 
                                        className="btn btn-outline" 
                                        onClick={() => setPage(p => p + 1)}
                                        style={{ padding: '0.75rem 2rem', fontWeight: '600', borderRadius: 'var(--radius-full)' }}
                                    >
                                        Load More
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState 
                            icon={Search}
                            title="No products found"
                            description="Try adjusting your search or category filters to find what you're looking for."
                            actionText="Clear All Filters"
                            onAction={() => {
                                setPriceRange(150000);
                                setLocalPriceRange(150000);
                                setSelectedRating(0);
                                handleCategory('All');
                                if (search) {
                                    navigate('/products');
                                }
                            }}
                        />
                    )}
                </div>
            </div>
            
            <style>{`
                @media (max-width: 1024px) {
                    .mobile-hidden {
                        display: none !important;
                    }
                }
            `}</style>
            </div>
        </LazyMotion>
    );
};

export default Products;
