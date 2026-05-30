import React, { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch('http://localhost:5000/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (!res.ok) {
                    throw new Error('Failed to fetch user profile');
                }
                
                const data = await res.json();
                if (data.success) {
                    setUser(data.data);
                } else {
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            } catch (err) {
                console.error(err);
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!res.ok) {
            let errorMsg = 'Login failed';
            try {
                const errorData = await res.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) {
                // Ignore json parse errors for bad responses
            }
            throw new Error(errorMsg);
        }

        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
            return data.user;
        } else {
            throw new Error(data.message || 'Login failed');
        }
    };

    const signup = async (name, email, password) => {
        const res = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        if (!res.ok) {
            let errorMsg = 'Signup failed';
            try {
                const errorData = await res.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) {
                // Ignore json parse error
            }
            throw new Error(errorMsg);
        }

        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
            return data.user;
        } else {
            throw new Error(data.message || 'Signup failed');
        }
    };

    const updateProfile = async (updates) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updates)
            });

            if (!res.ok) {
                throw new Error('Failed to update profile');
            }

            const data = await res.json();
            if (data.success) {
                setUser(data.data);
                toast.success('Profile updated successfully');
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Failed to update profile');
            throw err;
        }
    };

    const logout = async () => {
        try {
            await fetch('http://localhost:5000/api/auth/logout');
        } catch (e) { console.error(e); }
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
