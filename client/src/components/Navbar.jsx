import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Sun, Moon, Package, Menu, X, Search, User, ChevronDown, Crown, LogOut, Heart } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { WishlistContext } from '../context/WishlistContext';
import { NotificationContext } from '../context/NotificationContext';
import { Bell, Trash2, CheckCircle } from 'lucide-react';

const Navbar = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { cartCount, toggleCartDrawer } = useContext(CartContext);
    const { user, logout } = useContext(AuthContext);
    const { wishlist } = useContext(WishlistContext);
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useContext(NotificationContext);
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState(() => {
        const saved = localStorage.getItem('recentSearches');
        return saved ? JSON.parse(saved) : [];
    });
    
    const navigate = useNavigate();
    const profileMenuRef = useRef(null);
    const notificationMenuRef = useRef(null);
    const searchRef = useRef(null);
    const mobileSearchRef = useRef(null);

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };
    
    // Hash string to color
    const getAvatarColor = (name) => {
        if (!name) return 'var(--primary)';
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const saveSearchQuery = (query) => {
        if (!query || !query.trim()) return;
        const q = query.trim();
        const updated = [q, ...recentSearches.filter(item => item.toLowerCase() !== q.toLowerCase())].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const clearRecentSearches = (e) => {
        e.stopPropagation();
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            saveSearchQuery(searchQuery);
            const queryLower = searchQuery.trim().toLowerCase();
            const suggestionsMap = {
                'laptops': '/products?category=Laptops',
                'laptop': '/products?category=Laptops',
                'smartphones': '/products?category=Mobiles',
                'smartphone': '/products?category=Mobiles',
                'mobiles': '/products?category=Mobiles',
                'mobile': '/products?category=Mobiles',
                'headphones': '/products?category=Headphones',
                'headphone': '/products?category=Headphones',
                'nike shoes': '/products?category=Shoes&search=Nike',
                'nike': '/products?category=Shoes&search=Nike',
                'shoes': '/products?category=Shoes',
                'shoe': '/products?category=Shoes',
                'watches for men': '/products?category=Watches',
                'watches': '/products?category=Watches',
                'watch': '/products?category=Watches'
            };
            const targetUrl = suggestionsMap[queryLower] || `/products?search=${encodeURIComponent(searchQuery)}`;
            navigate(targetUrl);
            setShowSearchSuggestions(false);
            setIsMenuOpen(false);
        }
    };

    const handleSuggestionClick = (term) => {
        setSearchQuery(term);
        saveSearchQuery(term);
        const suggestionsMap = {
            'Laptops': '/products?category=Laptops',
            'Smartphones': '/products?category=Mobiles',
            'Headphones': '/products?category=Headphones',
            'Nike Shoes': '/products?category=Shoes&search=Nike',
            'Watches for Men': '/products?category=Watches'
        };
        const targetUrl = suggestionsMap[term] || `/products?search=${encodeURIComponent(term)}`;
        navigate(targetUrl);
        setShowSearchSuggestions(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target) && mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
                setShowSearchSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
        setIsMenuOpen(false);
        navigate('/');
    };

    const searchSuggestions = ['Laptops', 'Smartphones', 'Headphones', 'Nike Shoes', 'Watches for Men'];

    return (
        <nav className="glass-nav" style={{ padding: '0.75rem 0' }}>
            <div className="container flex flex-col gap-4">
                {/* Top Row: Logo, Search (Desktop), Icons */}
                <div className="flex justify-between items-center gap-6">
                    <Link to="/" className="flex items-center gap-2" style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '1.5rem', flexShrink: 0 }}>
                        <Package size={28} style={{ color: 'var(--secondary)' }} />
                        <span>LuxeMart</span>
                    </Link>

                    {/* Desktop Search Bar */}
                    <div className="desktop-only search-bar-wrapper flex-grow" style={{ maxWidth: '600px', position: 'relative' }} ref={searchRef}>
                        <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
                            <input 
                                type="text" 
                                placeholder="Search for products, brands and more..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setShowSearchSuggestions(true)}
                                style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: 'var(--radius-full)' }}
                            />
                            <button 
                                type="submit" 
                                style={{ 
                                    position: 'absolute', 
                                    left: 0, 
                                    top: 0, 
                                    bottom: 0, 
                                    width: '2.5rem', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    color: 'var(--text-muted)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer' 
                                }} 
                                aria-label="Search"
                            >
                                <Search size={20} />
                            </button>
                        </form>
                        
                        {/* Search Autocomplete Dropdown */}
                        {showSearchSuggestions && (
                            <div className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem', padding: '0.5rem 0', zIndex: 100, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)' }}>
                                {recentSearches.length > 0 && (
                                    <>
                                        <div style={{ padding: '0.25rem 1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>Recent Searches</span>
                                            <button type="button" onClick={clearRecentSearches} style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: '600', textTransform: 'none', cursor: 'pointer' }}>Clear All</button>
                                        </div>
                                        {recentSearches.map((term, i) => (
                                            <div 
                                                key={`recent-${i}`}
                                                onClick={() => handleSuggestionClick(term)}
                                                className="hover:bg-subtle hover:text-primary transition"
                                                style={{ padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                                            >
                                                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                                                {term}
                                            </div>
                                        ))}
                                        <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }}></div>
                                    </>
                                )}
                                <div style={{ padding: '0.25rem 1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trending Searches</div>
                                {searchSuggestions.map((term, i) => (
                                    <div 
                                        key={i}
                                        onClick={() => handleSuggestionClick(term)}
                                        className="hover:bg-subtle hover:text-primary transition"
                                        style={{ padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                                    >
                                        <Search size={14} style={{ color: 'var(--text-muted)' }} />
                                        {term}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4" style={{ flexShrink: 0 }}>
                        
                        <Link to="/membership" className="desktop-only flex items-center gap-1 hover:text-primary transition" style={{ padding: '0.5rem', fontWeight: '600', color: 'var(--warning-text)' }}>
                            <Crown size={20} />
                            <span>Try Plus</span>
                        </Link>
                        
                        {user ? (
                            <div className="desktop-only relative" ref={profileMenuRef}>
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 hover:text-primary transition" 
                                    style={{ padding: '0.25rem 0.5rem', fontWeight: '500', background: 'transparent', border: 'none', color: 'inherit' }}
                                    aria-label="User profile menu"
                                >
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Profile" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ 
                                            width: '28px', height: '28px', borderRadius: '50%', 
                                            background: getAvatarColor(user.name), color: 'white', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            fontWeight: 'bold', fontSize: '11px' 
                                        }}>
                                            {getInitials(user.name)}
                                        </div>
                                    )}
                                    <div className="flex-col" style={{ alignItems: 'flex-start', lineHeight: '1.2' }}>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hello, {user.name.split(' ')[0]}</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Account & Lists</span>
                                    </div>
                                    <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
                                </button>

                                {isProfileOpen && (
                                    <div className="glass-panel" style={{ 
                                        position: 'absolute', top: '100%', right: '0', 
                                        marginTop: '0.5rem', minWidth: '220px', 
                                        padding: '0.5rem 0', zIndex: 100, 
                                        display: 'flex', flexDirection: 'column' 
                                    }}>
                                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                        </div>
                                        <Link to="/profile" onClick={() => setIsProfileOpen(false)} style={{ padding: '0.5rem 1rem', display: 'block', fontSize: '0.875rem' }} className="hover:text-primary hover:bg-subtle transition">My Profile</Link>
                                        <Link to="/orders" onClick={() => setIsProfileOpen(false)} style={{ padding: '0.5rem 1rem', display: 'block', fontSize: '0.875rem' }} className="hover:text-primary hover:bg-subtle transition">My Orders</Link>
                                        <Link to="/wishlist" onClick={() => setIsProfileOpen(false)} style={{ padding: '0.5rem 1rem', display: 'block', fontSize: '0.875rem' }} className="hover:text-primary hover:bg-subtle transition">Wishlist</Link>
                                        <div style={{ margin: '0.25rem 0', borderTop: '1px solid var(--border-color)' }}></div>
                                        <button 
                                            onClick={handleLogout}
                                            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', textAlign: 'left', color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                                            className="hover:bg-subtle transition"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/signin" className="desktop-only flex items-center gap-1 hover:text-primary transition" style={{ padding: '0.5rem', fontWeight: '500' }}>
                                <div className="flex-col" style={{ alignItems: 'flex-start', lineHeight: '1.2' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hello, sign in</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Account & Lists</span>
                                </div>
                            </Link>
                        )}
                        
                        <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle theme" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
                            {theme === 'dark' ? <Sun size={22} style={{ color: 'var(--warning)' }} /> : <Moon size={22} />}
                        </button>
                        
                        <Link to="/wishlist" className="flex items-center gap-1 hover:text-primary transition" style={{ position: 'relative', padding: '0.25rem 0.5rem' }} aria-label="View wishlist">
                            <div style={{ position: 'relative' }}>
                                <Heart size={24} />
                                {wishlist.length > 0 && (
                                    <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                        {wishlist.length}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* Notification Bell */}
                        {user && (
                            <div className="relative" ref={notificationMenuRef}>
                                <button 
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)} 
                                    className="flex items-center gap-1 hover:text-primary transition btn-icon" 
                                    style={{ position: 'relative', background: 'transparent', border: 'none', boxShadow: 'none', padding: '0.25rem 0.5rem' }}
                                    aria-label="View notifications"
                                >
                                    <div style={{ position: 'relative' }}>
                                        <Bell size={24} />
                                        {unreadCount > 0 && (
                                            <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--danger)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </button>
                                
                                {isNotificationOpen && (
                                    <div className="glass-panel" style={{ 
                                        position: 'absolute', top: '100%', right: '0', 
                                        marginTop: '0.5rem', width: '320px', 
                                        padding: '1rem', zIndex: 100, 
                                        display: 'flex', flexDirection: 'column',
                                        maxHeight: '400px', overflowY: 'auto'
                                    }}>
                                        <div className="flex justify-between items-center" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: '600' }}>Notifications</div>
                                            <div className="flex gap-2">
                                                {unreadCount > 0 && (
                                                    <button onClick={markAllAsRead} className="hover:text-primary" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        Mark all read
                                                    </button>
                                                )}
                                                {notifications.length > 0 && (
                                                    <button onClick={clearNotifications} className="hover:text-danger" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                        Clear
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {notifications.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                No new notifications
                                            </div>
                                        ) : (
                                            <div className="flex-col gap-3">
                                                {notifications.map(n => (
                                                    <div key={n.id} onClick={() => markAsRead(n.id)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: n.read ? 'transparent' : 'var(--bg-subtle)', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'var(--transition)' }} className="hover:border-primary">
                                                        <div className="flex justify-between items-start" style={{ marginBottom: '0.25rem' }}>
                                                            <div style={{ fontWeight: '600', fontSize: '0.875rem', color: n.read ? 'var(--text-main)' : 'var(--primary)' }}>{n.title}</div>
                                                            {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 }}></div>}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{n.message}</div>
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
                                                            {new Date(n.date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <button onClick={toggleCartDrawer} className="flex items-center gap-1 hover:text-primary transition" style={{ position: 'relative', background: 'transparent', border: 'none', boxShadow: 'none', color: 'inherit', padding: '0.25rem 0.5rem', flexShrink: 0 }} aria-label="View cart">
                            <div style={{ position: 'relative' }}>
                                <ShoppingCart size={26} />
                                {cartCount > 0 && (
                                    <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="desktop-only" style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: 'auto' }}>Cart</span>
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button className="mobile-only btn-icon" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'transparent', border: 'none', boxShadow: 'none' }} aria-label="Toggle mobile menu">
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Row (Always visible on mobile below the top bar) */}
                <div className="mobile-only" style={{ position: 'relative', width: '100%', padding: '0 0.5rem 0.25rem' }} ref={mobileSearchRef}>
                    <form onSubmit={handleSearchSubmit} style={{ width: '100%', position: 'relative' }}>
                        <input 
                            type="text" 
                            placeholder="Search products, brands and more..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowSearchSuggestions(true)}
                            style={{ 
                                width: '100%',
                                padding: '0.65rem 1rem 0.65rem 2.75rem', 
                                borderRadius: 'var(--radius-full)', 
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-main)',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                        <button 
                            type="submit" 
                            style={{ 
                                position: 'absolute', 
                                left: 0, 
                                top: 0, 
                                bottom: 0, 
                                width: '2.75rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: 'var(--text-muted)',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer' 
                            }} 
                            aria-label="Search"
                        >
                            <Search size={18} />
                        </button>
                    </form>

                    {/* Mobile Autocomplete Dropdown */}
                    {showSearchSuggestions && (
                        <div className="glass-panel" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem', padding: '0.5rem 0', zIndex: 100, border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', maxHeight: '300px', overflowY: 'auto' }}>
                            {recentSearches.length > 0 && (
                                <>
                                    <div style={{ padding: '0.25rem 1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Recent Searches</span>
                                        <button type="button" onClick={clearRecentSearches} style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: '600', textTransform: 'none', cursor: 'pointer' }}>Clear All</button>
                                    </div>
                                    {recentSearches.map((term, i) => (
                                        <div 
                                            key={`mobile-recent-${i}`}
                                            onClick={() => handleSuggestionClick(term)}
                                            className="hover:bg-subtle hover:text-primary transition"
                                            style={{ padding: '0.65rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
                                        >
                                            <Search size={16} style={{ color: 'var(--text-muted)' }} />
                                            {term}
                                        </div>
                                    ))}
                                    <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }}></div>
                                </>
                            )}
                            <div style={{ padding: '0.25rem 1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trending Searches</div>
                            {searchSuggestions.map((term, i) => (
                                <div 
                                    key={`mobile-trend-${i}`}
                                    onClick={() => handleSuggestionClick(term)}
                                    className="hover:bg-subtle hover:text-primary transition"
                                    style={{ padding: '0.65rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
                                >
                                    <Search size={16} style={{ color: 'var(--text-muted)' }} />
                                    {term}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bottom Row: Categories (Desktop) */}
                <div className="desktop-only flex items-center gap-6" style={{ padding: '0.5rem 0', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem', fontWeight: '500' }}>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-primary" style={{ fontWeight: '600' }}>
                        <Menu size={18} />
                        <span>All Categories</span>
                        <ChevronDown size={14} />
                    </div>
                    <NavLink to="/products?category=Electronics" style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-muted)' })}>Electronics</NavLink>
                    <NavLink to="/products?category=Fashion" style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-muted)' })}>Fashion</NavLink>
                    <NavLink to="/products?category=Furniture" style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-muted)' })}>Furniture</NavLink>
                    <NavLink to="/products?category=Shoes" style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-muted)' })}>Shoes</NavLink>
                    <NavLink to="/products?category=Watches" style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-muted)' })}>Watches</NavLink>
                    <NavLink to="/products?category=Home Decor" style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-muted)' })}>Home Decor</NavLink>
                    <NavLink to="/products?category=Gaming" style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-muted)' })}>Gaming</NavLink>
                    <NavLink to="/products?category=Beauty" style={({isActive}) => ({ color: isActive ? 'var(--primary)' : 'var(--text-muted)' })}>Beauty</NavLink>
                </div>
            </div>

            {/* Mobile Nav Drawer */}
            {isMenuOpen && (
                <div className="mobile-only glass-panel" style={{ position: 'absolute', top: '100%', left: '0', right: '0', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', zIndex: 99 }}>
                    <div className="flex-col gap-2">
                        <div style={{ fontWeight: '600', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Account</div>
                        
                        {user ? (
                            <>
                                <div style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ fontWeight: '500' }}>{user.name}</span>
                                </div>
                                <Link to="/orders" onClick={() => setIsMenuOpen(false)} style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>My Orders</Link>
                                <button onClick={handleLogout} style={{ padding: '0.5rem', color: 'var(--danger)', textAlign: 'left', background: 'transparent', border: 'none', width: '100%', display: 'flex', gap: '0.5rem' }}>
                                    <LogOut size={18}/> Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/signin" onClick={() => setIsMenuOpen(false)} style={{ padding: '0.5rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}><User size={18}/> Sign In</Link>
                        )}
                        
                        <Link to="/membership" onClick={() => setIsMenuOpen(false)} style={{ padding: '0.5rem', color: 'var(--warning)', display: 'flex', gap: '0.5rem', fontWeight: '600' }}><Crown size={18}/> Try Plus</Link>

                        <div style={{ fontWeight: '600', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', marginTop: '1rem' }}>Categories</div>
                        <NavLink to="/products" onClick={() => setIsMenuOpen(false)} style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>All Products</NavLink>
                        <NavLink to="/products?category=Electronics" onClick={() => setIsMenuOpen(false)} style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Electronics</NavLink>
                        <NavLink to="/products?category=Fashion" onClick={() => setIsMenuOpen(false)} style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Fashion</NavLink>
                        <NavLink to="/products?category=Furniture" onClick={() => setIsMenuOpen(false)} style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Furniture</NavLink>
                        <NavLink to="/products?category=Shoes" onClick={() => setIsMenuOpen(false)} style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>Shoes</NavLink>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default React.memo(Navbar);
