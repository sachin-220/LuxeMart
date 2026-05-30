import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Star, StarHalf, Heart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import ImageWithFallback from './ImageWithFallback';

// Presentational component wrapped in React.memo
const ProductCardInner = React.memo(({ product, addToCart, toggleWishlist, inWishlist }) => {
    const membershipPlan = localStorage.getItem('membershipPlan') || 'Basic';
    const isPremium = membershipPlan === 'Plus' || membershipPlan === 'Prime' || membershipPlan === 'Elite';

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!product || product.stock <= 0) {
            toast.error('This product is currently out of stock');
            return;
        }
        addToCart(product, 1);
        toast.success(`${product.title} added to cart!`);
    };

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
    };

    // Render stars based on rating
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`full-${i}`} size={16} className="star-icon" />);
        }
        if (hasHalfStar) {
            stars.push(<StarHalf key="half" size={16} className="star-icon" />);
        }
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} size={16} color="var(--border-color)" />);
        }
        return stars;
    };

    const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

    // Deterministic bank offer badge logic based on product ID character hash
    const hasBankOffer = product._id ? (product._id.charCodeAt(product._id.length - 1) % 3 === 0) : false;

    return (
        <div className="product-card fade-in" style={{ position: 'relative' }}>
            <button 
                onClick={handleWishlistToggle}
                style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 20, background: 'var(--bg-card)', border: 'none', borderRadius: '50%', padding: '0.4rem', boxShadow: 'var(--shadow-sm)', color: inWishlist ? 'var(--danger)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Toggle Wishlist"
            >
                <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <Link to={`/products/${product._id}`} className="product-image-container">
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 10, alignItems: 'flex-start' }}>
                    {/* Membership Badges */}
                    {product.price > 49999 && (membershipPlan === 'Elite' || membershipPlan === 'Prime') && (
                        <div style={{ background: '#fbbf24', color: 'black', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)' }}>
                            Elite Deal
                        </div>
                    )}
                    {product.price > 999 && product.price <= 49999 && isPremium && (
                        <div style={{ background: 'var(--primary)', color: 'white', padding: '4px 8px', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)' }}>
                            Prime Exclusive
                        </div>
                    )}
                </div>
                <ImageWithFallback 
                    src={product.image} 
                    alt={product.title} 
                    className="product-image"
                    width="300"
                    height="300"
                />
            </Link>
            
            <div className="product-info gap-2">
                <Link to={`/products/${product._id}`}>
                    <h3 className="product-title" title={product.title}>{product.title}</h3>
                </Link>
                
                {/* Ratings */}
                <div className="product-rating">
                    {renderStars(product.rating || 0)}
                    <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>
                        ({product.reviewCount || 0})
                    </span>
                </div>

                {/* Pricing */}
                <div className="product-pricing" style={{ marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '0.5rem' }}>
                    <div className="current-price" style={{ fontSize: '1.4rem', fontWeight: '800' }}>{formatINR(product.price)}</div>
                    {product.discountPercentage > 0 && (
                        <>
                            <div className="original-price" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                M.R.P: {formatINR(product.originalPrice)}
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#cc0c39' }}>
                                ({product.discountPercentage}% off)
                            </div>
                        </>
                    )}
                </div>
                
                {hasBankOffer && (
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--success-text)', marginBottom: '0.25rem' }}>
                        Bank Offer Available
                    </div>
                )}
                
                {product.stock > 0 && product.stock < 20 && (
                    <div style={{ color: 'var(--danger-text)', fontSize: '0.7rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                        Only {product.stock} left in stock - order soon.
                    </div>
                )}
                {product.stock <= 0 && (
                    <div style={{ color: '#dc2625', fontSize: '0.7rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                        OUT OF STOCK
                    </div>
                )}
                
                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: '0.75rem', lineHeight: '1.3' }}>
                    {isPremium ? (
                        <>
                            <span style={{ color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ color: 'var(--success-text)' }}>✓</span> FREE Premium Delivery
                            </span>
                            <div style={{ color: 'var(--text-muted)' }}>{product.deliveryEstimation}</div>
                        </>
                    ) : (
                        <>
                            <span style={{ color: product.price > 499 ? 'var(--success-text)' : 'var(--text-muted)', fontWeight: '600' }}>
                                {product.price > 499 ? 'FREE Delivery' : '₹50 Delivery'}
                            </span>
                            <div style={{ color: 'var(--text-muted)' }}>{product.deliveryEstimation}</div>
                        </>
                    )}
                </div>
                
                {product.stock > 0 ? (
                    <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', marginTop: 'auto', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem' }}
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </button>
                ) : (
                    <button 
                        className="btn btn-primary" 
                        disabled
                        style={{ background: '#9ca3af', color: '#fff', width: '100%', marginTop: 'auto', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem', opacity: 0.6 }}
                    >
                        Currently Unavailable
                    </button>
                )}
            </div>
        </div>
    );
});

// Container component that consumes context and calculates primitive props
const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const inWishlist = isInWishlist(product._id);

    return (
        <ProductCardInner
            product={product}
            addToCart={addToCart}
            toggleWishlist={toggleWishlist}
            inWishlist={inWishlist}
        />
    );
};

export default React.memo(ProductCard);
