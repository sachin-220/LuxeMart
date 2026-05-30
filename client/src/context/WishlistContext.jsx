import React, { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        try {
            const savedWishlist = localStorage.getItem('luxemart_wishlist');
            if (savedWishlist) {
                setWishlist(JSON.parse(savedWishlist));
            }
        } catch (error) {
            console.error("Failed to load wishlist", error);
        }
    }, []);

    const addToWishlist = useCallback((product) => {
        setWishlist(prev => {
            if (!prev.find(item => item._id === product._id)) {
                const newWishlist = [...prev, product];
                try {
                    localStorage.setItem('luxemart_wishlist', JSON.stringify(newWishlist));
                } catch (error) {
                    console.error("Failed to save wishlist", error);
                }
                toast.success('Added to Wishlist');
                return newWishlist;
            }
            return prev;
        });
    }, []);

    const removeFromWishlist = useCallback((productId) => {
        setWishlist(prev => {
            const newWishlist = prev.filter(item => item._id !== productId);
            try {
                localStorage.setItem('luxemart_wishlist', JSON.stringify(newWishlist));
            } catch (error) {
                console.error("Failed to save wishlist", error);
            }
            toast.success('Removed from Wishlist');
            return newWishlist;
        });
    }, []);

    const isInWishlist = useCallback((productId) => {
        return wishlist.some(item => item._id === productId);
    }, [wishlist]);

    const toggleWishlist = useCallback((product) => {
        setWishlist(prev => {
            const exists = prev.some(item => item._id === product._id);
            let newWishlist;
            if (exists) {
                newWishlist = prev.filter(item => item._id !== product._id);
                toast.success('Removed from Wishlist');
            } else {
                newWishlist = [...prev, product];
                toast.success('Added to Wishlist');
            }
            try {
                localStorage.setItem('luxemart_wishlist', JSON.stringify(newWishlist));
            } catch (error) {
                console.error("Failed to save wishlist", error);
            }
            return newWishlist;
        });
    }, []);

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            toggleWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
