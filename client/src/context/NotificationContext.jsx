import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Simulated Polling for Notifications
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const pollNotifications = () => {
            const existing = JSON.parse(localStorage.getItem(`notifications_${user.email}`)) || [];
            
            // Randomly push a mock notification for demonstration purposes occasionally (avoiding duplicates)
            if (Math.random() > 0.8 && existing.length < 10) {
                const hasOffer = existing.some(n => n.title === 'New Offer Available!');
                if (!hasOffer) {
                    existing.unshift({
                        id: Date.now(),
                        title: 'New Offer Available!',
                        message: 'Get 20% off on premium fashion. Use code LUXE20.',
                        read: false,
                        date: new Date().toISOString()
                    });
                    localStorage.setItem(`notifications_${user.email}`, JSON.stringify(existing));
                }
            }

            setNotifications(existing);
            setUnreadCount(existing.filter(n => !n.read).length);
        };

        // Poll every 2 minutes (Simulating a simple pull architecture for Phase 1)
        pollNotifications();
        const interval = setInterval(pollNotifications, 120000);

        return () => clearInterval(interval);
    }, [user]);

    const markAsRead = (id) => {
        if (!user) return;
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        setNotifications(updated);
        setUnreadCount(updated.filter(n => !n.read).length);
        localStorage.setItem(`notifications_${user.email}`, JSON.stringify(updated));
    };

    const markAllAsRead = () => {
        if (!user) return;
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        setUnreadCount(0);
        localStorage.setItem(`notifications_${user.email}`, JSON.stringify(updated));
    };

    const clearNotifications = () => {
        if (!user) return;
        setNotifications([]);
        setUnreadCount(0);
        localStorage.setItem(`notifications_${user.email}`, JSON.stringify([]));
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            clearNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
