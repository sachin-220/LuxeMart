import React, { createContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = useCallback((product, qty = 1) => {
        if (!product || product.stock <= 0) {
            toast.error('This product is currently out of stock');
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item._id === product._id);
            if (existing) {
                return prev.map(item => 
                    item._id === product._id ? { ...item, quantity: item.quantity + qty } : item
                );
            }
            return [...prev, { ...product, quantity: qty }];
        });
        setIsCartDrawerOpen(true); // Open drawer automatically when adding to cart
    }, []);

    const removeFromCart = useCallback((productId) => {
        setCart(prev => prev.filter(item => item._id !== productId));
    }, []);

    const updateQuantity = useCallback((productId, amount) => {
        setCart(prev => prev.map(item => {
            if (item._id === productId) {
                const newQuantity = Math.max(1, item.quantity + amount);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);
    
    const toggleCartDrawer = useCallback(() => setIsCartDrawerOpen(prev => !prev), []);
    const closeCartDrawer = useCallback(() => setIsCartDrawerOpen(false), []);

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ 
            cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount,
            isCartDrawerOpen, toggleCartDrawer, closeCartDrawer
        }}>
            {children}
        </CartContext.Provider>
    );
};
