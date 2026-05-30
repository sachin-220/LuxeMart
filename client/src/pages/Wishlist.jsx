import React, { useContext } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';

const Wishlist = () => {
    const { wishlist } = useContext(WishlistContext);

    return (
        <div className="container fade-in" style={{ paddingBottom: '3rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={28} style={{ color: 'var(--danger)' }} /> My Wishlist
            </h1>

            {wishlist.length === 0 ? (
                <EmptyState 
                    icon={Heart}
                    title="Your wishlist is empty"
                    description="Save items that you like in your wishlist. Review them anytime and easily move them to the cart."
                    actionText="Continue Shopping"
                />
            ) : (
                <>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist
                    </p>
                    <div className="product-grid">
                        {wishlist.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Wishlist;
