import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { fetchProductById } from '../services/api';
import { CartContext } from '../context/CartContext';
import Loader from '../components/Loader';
import { ProductDetailsSkeleton } from '../components/SkeletonLoader';
import { AuthContext } from '../context/AuthContext';
import { WishlistContext } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { ShoppingCart, Star, StarHalf, Truck, ShieldCheck, Heart, Share2, Check, Tag, Trash2, Edit, ThumbsUp } from 'lucide-react';


const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    
    // Reviews UI states
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [submittingReview, setSubmittingReview] = useState(false);

    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const { isInWishlist, toggleWishlist } = useContext(WishlistContext);

    const [relatedProducts, setRelatedProducts] = useState([]);

    const getProduct = async () => {
        try {
            const data = await fetchProductById(id);
            setProduct(data.product);
            
            // Fetch related products
            const relatedRes = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}/related`);
            const relatedData = await relatedRes.json();
            if (relatedData.success) {
                setRelatedProducts(relatedData.products);
            }
        } catch (err) {
            setError('Product not found or error loading details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        getProduct();
    }, [id]);

    const handleAddToCart = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!product || product.stock <= 0) {
            toast.error('This product is currently out of stock');
            return;
        }
        addToCart(product, quantity);
        toast.success(`${product.title} added to cart!`);
    };

    const handleBuyNow = () => {
        if (!product || product.stock <= 0) {
            toast.error('This product is currently out of stock');
            return;
        }
        if (!user) {
            toast.error("Please sign in to continue");
            navigate('/signin');
            return;
        }
        addToCart(product, quantity);
        navigate('/checkout');
    };

    // Review Submit
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            toast.error('Please login to leave a review');
            return;
        }
        if (!comment.trim()) {
            toast.error('Please add a comment');
            return;
        }

        setSubmittingReview(true);
        try {
            if (editingReviewId) {
                const res = await api.put(`/products/${id}/reviews/${editingReviewId}`, { rating, comment });
                if (res.data.success) {
                    toast.success('Review updated successfully');
                    setEditingReviewId(null);
                    setComment('');
                    setRating(5);
                    getProduct();
                }
            } else {
                const res = await api.post(`/products/${id}/reviews`, { rating, comment });
                if (res.data.success) {
                    toast.success('Review submitted successfully');
                    setComment('');
                    setRating(5);
                    getProduct();
                }
            }
        } catch (err) {
            // Toast handled by API interceptor
        } finally {
            setSubmittingReview(false);
        }
    };

    // Review Edit Initiate
    const startEditReview = (review) => {
        setEditingReviewId(review._id);
        setRating(review.rating);
        setComment(review.comment);
    };

    // Review Delete
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete your review?')) return;
        try {
            const res = await api.delete(`/products/${id}/reviews/${reviewId}`);
            if (res.data.success) {
                toast.success('Review deleted successfully');
                getProduct();
            }
        } catch (err) {
            // Handled by API interceptor
        }
    };

    const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

    if (loading) return <ProductDetailsSkeleton />;
    
    if (error) return (
        <div className="container empty-state fade-in">
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops!</h2>
            <p style={{ marginBottom: '2rem' }}>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>Back to Catalog</button>
        </div>
    );

    if (!product) return null;

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`full-${i}`} size={18} className="star-icon" fill="currentColor" style={{ color: 'var(--warning)' }} />);
        }
        if (hasHalfStar) {
            stars.push(<StarHalf key="half" size={18} className="star-icon" fill="currentColor" style={{ color: 'var(--warning)' }} />);
        }
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} size={18} color="var(--border-color)" />);
        }
        return stars;
    };

    const inWishlist = isInWishlist(product._id);

    // Calculate rating breakdown percentages
    const totalReviews = product.reviews?.length || 0;
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    product.reviews?.forEach(r => {
        if (ratingDistribution[r.rating] !== undefined) {
            ratingDistribution[r.rating] += 1;
        }
    });

    const getStockIndicator = () => {
        if (product.stock <= 0) {
            return <span style={{ color: '#dc2625', fontWeight: '600' }}>OUT OF STOCK</span>;
        } else if (product.stock <= 5) {
            return <span style={{ color: '#d97706', fontWeight: '600' }}>Only {product.stock} left in stock - order soon.</span>;
        } else {
            return <span style={{ color: 'var(--success)', fontWeight: '600' }}>In Stock</span>;
        }
    };

    const userReview = product.reviews?.find(r => user && r.user === user._id);

    return (
        <div className="fade-in" style={{ paddingBottom: '4rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <Link to="/" className="hover:text-primary">Home</Link>
                <span>/</span>
                <Link to={`/products?category=${product.category}`} className="hover:text-primary">{product.category}</Link>
                <span>/</span>
                <span style={{ color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.title}</span>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ 
                        border: '1px solid var(--border-color)', 
                        borderRadius: 'var(--radius-lg)', 
                        padding: '2rem', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        background: 'white',
                        position: 'relative'
                    }}>
                        <img 
                            src={product.image} 
                            alt={product.title} 
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=600&q=80' }}
                            style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }} 
                            loading="eager"
                            fetchPriority="high"
                            decoding="async"
                        />
                        <button 
                            className="btn-icon" 
                            style={{ position: 'absolute', top: '1rem', right: '1rem', color: inWishlist ? 'var(--danger)' : 'var(--text-muted)' }}
                            onClick={() => toggleWishlist(product)}
                        >
                            <Heart size={24} fill={inWishlist ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-col gap-4">
                    <h1 style={{ fontSize: '2rem', lineHeight: '1.2' }}>{product.title}</h1>
                    
                    <div className="flex items-center gap-4" style={{ fontSize: '0.875rem' }}>
                        <div className="flex items-center gap-1">
                            {renderStars(product.rating)}
                            <span style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}>{product.rating?.toFixed(1)} ({product.reviewCount} reviews)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                            <span>|</span>
                            <Share2 size={16} /> Share
                        </div>
                    </div>
                    
                    {product.tags && product.tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap" style={{ marginTop: '0.5rem' }}>
                            {product.tags.map((tag, i) => (
                                <span key={i} style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Tag size={12} /> {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1.5rem 0' }}>
                        <div className="flex items-end gap-3" style={{ marginBottom: '0.5rem' }}>
                            {product.discountPercentage > 0 && (
                                <span style={{ color: 'var(--danger)', fontSize: '1.5rem', fontWeight: '300' }}>-{product.discountPercentage}%</span>
                            )}
                            <span style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: '1' }}>{formatINR(product.price)}</span>
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                Typical price: <span style={{ textDecoration: 'line-through' }}>{formatINR(product.originalPrice)}</span>
                            </div>
                        )}
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Inclusive of all taxes</p>
                    </div>

                    <div>
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>About this item</h3>
                        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                            <li>{product.description}</li>
                            <li>Premium quality materials ensuring durability and comfort.</li>
                            <li>Designed for the modern lifestyle with advanced features.</li>
                            <li>Backed by our standard 1-year manufacturer warranty.</li>
                        </ul>
                    </div>
                </div>

                <div>
                    <div className="buy-box flex-col gap-4">
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatINR(product.price)}</div>
                        
                        <div style={{ color: 'var(--text-main)', fontSize: '0.875rem' }}>
                            <div className="flex gap-2 items-start" style={{ marginBottom: '0.5rem' }}>
                                <Truck size={18} style={{ color: 'var(--text-muted)' }} />
                                <div>
                                    <span style={{ color: product.price > 499 ? 'var(--success)' : 'inherit', fontWeight: '600' }}>
                                        {product.price > 499 ? 'FREE delivery' : '₹50 Delivery'}
                                    </span>
                                    <br />
                                    <span>{product.deliveryEstimation || "Delivery within 3 days"}</span>
                                </div>
                            </div>
                            <div className="flex gap-2 items-start">
                                <ShieldCheck size={18} style={{ color: 'var(--text-muted)' }} />
                                <div>Secure transaction</div>
                            </div>
                        </div>

                        <div>
                            {getStockIndicator()}
                        </div>

                        {product.stock > 0 && (
                            <div className="flex items-center gap-2">
                                <label htmlFor="quantity" style={{ fontSize: '0.875rem' }}>Quantity:</label>
                                <select 
                                    id="quantity"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)' }}
                                >
                                    {[...Array(Math.min(10, product.stock)).keys()].map(num => (
                                        <option key={num + 1} value={num + 1}>{num + 1}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            {product.stock > 0 ? (
                                <>
                                    <button 
                                        className="btn" 
                                        style={{ background: '#fbbf24', color: '#000', borderRadius: 'var(--radius-full)', width: '100%' }}
                                        onClick={handleAddToCart}
                                    >
                                        Add to Cart
                                    </button>
                                    <button 
                                        className="btn" 
                                        style={{ background: '#f59e0b', color: '#000', borderRadius: 'var(--radius-full)', width: '100%' }}
                                        onClick={handleBuyNow}
                                    >
                                        Buy Now
                                    </button>
                                </>
                            ) : (
                                <button 
                                    className="btn" 
                                    disabled
                                    style={{ background: '#9ca3af', color: '#fff', borderRadius: 'var(--radius-full)', width: '100%', opacity: 0.6 }}
                                >
                                    Currently Unavailable
                                </button>
                            )}
                        </div>

                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Ships from</span>
                            <span>{product.shippingHub || 'LuxeMart Fulfillment'}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Sold by</span>
                            <span>{product.seller || 'LuxeMart Official'}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Returns</span>
                            <span style={{ color: 'var(--primary)' }}>{product.returnPolicy || 'Eligible for Return, Refund or Replacement'}</span>
                        </div>
                    </div>
                </div>

            </div>
            
            {/* Customer Reviews Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem', marginBottom: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem' }}>Customer Reviews</h2>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex">
                            {renderStars(product.rating)}
                        </div>
                        <span style={{ fontWeight: '600' }}>{product.rating?.toFixed(1)} out of 5</span>
                    </div>
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
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        {product.reviewCount} customer ratings
                    </div>

                    {/* Breakdown bars */}
                    <div className="flex-col gap-2">
                        {[5, 4, 3, 2, 1].map(stars => {
                            const count = ratingDistribution[stars] || 0;
                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                            return (
                                <div key={stars} className="flex items-center gap-2" style={{ fontSize: '0.875rem' }}>
                                    <span style={{ minWidth: '45px' }}>{stars} star</span>
                                    <div style={{ flex: 1, height: '16px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${percentage}%`, height: '100%', background: '#f59e0b' }}></div>
                                    </div>
                                    <span style={{ minWidth: '35px', textAlign: 'right' }}>{Math.round(percentage)}%</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Write Review Form */}
                    {user && (!userReview || editingReviewId) ? (
                        <form onSubmit={handleReviewSubmit} style={{ marginTop: '2rem', background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
                                {editingReviewId ? 'Edit Your Review' : 'Write a Customer Review'}
                            </h3>
                            <div className="mb-4">
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rating</label>
                                <select 
                                    value={rating} 
                                    onChange={(e) => setRating(Number(e.target.value))}
                                    style={{ padding: '0.5rem', width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)' }}
                                >
                                    <option value="5">5 Stars (Excellent)</option>
                                    <option value="4">4 Stars (Very Good)</option>
                                    <option value="3">3 Stars (Average)</option>
                                    <option value="2">2 Stars (Below Average)</option>
                                    <option value="1">1 Star (Poor)</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Review Comment</label>
                                <textarea 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="What did you like or dislike?"
                                    rows={4}
                                    style={{ padding: '0.5rem', width: '100%', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)' }}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                                    {submittingReview ? 'Submitting...' : editingReviewId ? 'Update Review' : 'Submit Review'}
                                </button>
                                {editingReviewId && (
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={() => {
                                            setEditingReviewId(null);
                                            setComment('');
                                            setRating(5);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    ) : user ? (
                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            You have already submitted a review for this product.
                        </div>
                    ) : (
                        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Please <Link to="/signin" style={{ color: 'var(--primary)' }}>sign in</Link> to leave a review.
                        </div>
                    )}
                </div>

                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Customer Review List</h2>
                    {product.reviews?.length === 0 ? (
                        <div style={{ color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '2rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                            No reviews yet. Be the first to review this product!
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                            {/* Positive Column */}
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '4px', height: '18px', background: '#16a34a', borderRadius: '2px' }}></span>
                                    Positive Reviews (4-5 Stars)
                                </h3>
                                <div className="flex-col">
                                    {product.reviews?.filter(r => r.rating >= 4).length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No positive reviews yet.</p>
                                    ) : (
                                        product.reviews?.filter(r => r.rating >= 4).map((rev) => (
                                            <div key={rev._id} className="glass-panel" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', marginBottom: '1.25rem', boxShadow: 'none', transition: 'var(--transition)' }}>
                                                <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e0e0e0', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.8rem' }}>
                                                        {rev.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>{rev.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star key={star} size={12} fill={star <= rev.rating ? '#ff9900' : 'none'} color={star <= rev.rating ? '#ff9900' : 'var(--border-color)'} />
                                                        ))}
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>{rev.rating}.0 out of 5 stars</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                    Reviewed on {new Date(rev.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                                {rev.isVerifiedPurchase && (
                                                    <div style={{ color: '#c45500', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                                        Verified Purchase
                                                    </div>
                                                )}
                                                <p style={{ fontSize: '0.875rem', lineHeight: '1.5', margin: '0.5rem 0', color: 'var(--text-main)' }}>{rev.comment}</p>
                                                
                                                <div className="flex items-center justify-between" style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                                                    <button 
                                                        className="btn" 
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#f0f2f2', border: '1px solid #a2a6ac', borderRadius: '4px', cursor: 'pointer', height: '28px', color: '#111' }}
                                                        onClick={() => toast.success('Thanks for your feedback!')}
                                                    >
                                                        <ThumbsUp size={12} /> Helpful
                                                    </button>
                                                    {user && rev.user === user._id && (
                                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                            <button
                                                                onClick={() => startEditReview(rev)}
                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
                                                            >
                                                                <Edit size={13} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteReview(rev._id)}
                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
                                                            >
                                                                <Trash2 size={13} /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Negative Column */}
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '4px', height: '18px', background: '#dc2626', borderRadius: '2px' }}></span>
                                    Negative & Mixed (1-3 Stars)
                                </h3>
                                <div className="flex-col">
                                    {product.reviews?.filter(r => r.rating < 4).length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No negative reviews yet.</p>
                                    ) : (
                                        product.reviews?.filter(r => r.rating < 4).map((rev) => (
                                            <div key={rev._id} className="glass-panel" style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', marginBottom: '1.25rem', boxShadow: 'none', transition: 'var(--transition)' }}>
                                                <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                                                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e0e0e0', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '0.8rem' }}>
                                                        {rev.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>{rev.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                                                    <div className="flex">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <Star key={star} size={12} fill={star <= rev.rating ? '#ff9900' : 'none'} color={star <= rev.rating ? '#ff9900' : 'var(--border-color)'} />
                                                        ))}
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>{rev.rating}.0 out of 5 stars</span>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                                    Reviewed on {new Date(rev.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                                {rev.isVerifiedPurchase && (
                                                    <div style={{ color: '#c45500', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                                                        Verified Purchase
                                                    </div>
                                                )}
                                                <p style={{ fontSize: '0.875rem', lineHeight: '1.5', margin: '0.5rem 0', color: 'var(--text-main)' }}>{rev.comment}</p>
                                                
                                                <div className="flex items-center justify-between" style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                                                    <button 
                                                        className="btn" 
                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#f0f2f2', border: '1px solid #a2a6ac', borderRadius: '4px', cursor: 'pointer', height: '28px', color: '#111' }}
                                                        onClick={() => toast.success('Thanks for your feedback!')}
                                                    >
                                                        <ThumbsUp size={12} /> Helpful
                                                    </button>
                                                    {user && rev.user === user._id && (
                                                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                            <button
                                                                onClick={() => startEditReview(rev)}
                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
                                                            >
                                                                <Edit size={13} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteReview(rev._id)}
                                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
                                                            >
                                                                <Trash2 size={13} /> Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Recommendations Section */}
            {relatedProducts.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>Products related to this item</h2>
                    <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                        {relatedProducts.map(rp => (
                            <ProductCard key={rp._id} product={rp} />
                        ))}
                    </div>
                </div>
            )}
            
            {/* Mobile Sticky Action Bar */}
            {product.stock > 0 ? (
                <div className="mobile-only mobile-sticky-action-bar">
                    <button 
                        type="button"
                        onClick={handleAddToCart}
                        style={{ background: '#fbbf24', color: '#000', border: 'none' }}
                    >
                        Add to Cart
                    </button>
                    <button 
                        type="button"
                        onClick={handleBuyNow}
                        style={{ background: '#f59e0b', color: '#000', border: 'none' }}
                    >
                        Buy Now
                    </button>
                </div>
            ) : (
                <div className="mobile-only mobile-sticky-action-bar" style={{ opacity: 0.6 }}>
                    <button disabled style={{ background: '#9ca3af', color: '#fff', width: '100%', border: 'none', padding: '1rem' }}>
                        Currently Unavailable
                    </button>
                </div>
            )}

            <style>{`
                @media (min-width: 1024px) {
                    .grid { grid-template-columns: 350px 1fr 300px !important; }
                }
                @media (max-width: 768px) {
                    .fade-in {
                        padding-bottom: 8rem !important;
                    }
                    .grid {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductDetails;
