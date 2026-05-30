import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Clear orders cache when user logs out or changes
    useEffect(() => {
        setOrders([]);
        setHasLoaded(false);
    }, [user]);

    const fetchOrders = useCallback(async (force = false) => {
        if (!user) return;
        if (hasLoaded && !force && orders.length > 0) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/orders/myorders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
                setHasLoaded(true);
            }
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
        }
    }, [user, hasLoaded, orders.length]);

    return (
        <OrderContext.Provider value={{ orders, setOrders, loading, fetchOrders, hasLoaded }}>
            {children}
        </OrderContext.Provider>
    );
};
