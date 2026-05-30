import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Package } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SignIn = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            toast.error('Please enter both email and password');
            return;
        }

        try {
            setLoading(true);
            await login(email, password);
            toast.success('Successfully logged in!');
            // Redirect to previous page or home
            navigate(-1);
        } catch (error) {
            toast.error(error.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container fade-in">
            <div className="glass-panel auth-card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div className="flex justify-center items-center gap-2" style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '2rem', marginBottom: '1rem' }}>
                        <Package size={32} /> LuxeMart
                    </div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Enter your credentials to access your account</p>
                </div>

                <form className="flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="email" 
                                className="input" 
                                placeholder="you@example.com" 
                                style={{ paddingLeft: '2.5rem' }} 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500' }}>Password</label>
                            <a href="#" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '500' }}>Forgot password?</a>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                className="input" 
                                placeholder="••••••••" 
                                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2" style={{ marginTop: '0.5rem' }}>
                        <input type="checkbox" id="remember" style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} />
                        <label htmlFor="remember" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Remember me for 30 days</label>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '0.875rem', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', borderTop: '1px solid var(--border-color)', zIndex: 1 }}></div>
                    <span style={{ position: 'relative', zIndex: 2, background: 'var(--bg-card)', padding: '0 1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Or continue with</span>
                </div>

                <div className="flex gap-4" style={{ marginTop: '2rem' }}>
                    <button className="btn btn-outline" type="button" style={{ flex: 1, display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                    </button>
                    <button className="btn btn-outline" type="button" style={{ flex: 1, display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.0001 0.200195C5.46513 0.200195 0.166748 5.49857 0.166748 12.0335C0.166748 17.2575 3.55171 21.6881 8.24838 23.2505C8.84004 23.3592 9.05671 22.9942 9.05671 22.6842C9.05671 22.4109 9.04671 21.6509 9.04004 20.6409C5.74671 21.3559 5.05171 19.0525 5.05171 19.0525C4.51338 17.6859 3.73671 17.3192 3.73671 17.3192C2.66171 16.5842 3.81838 16.5992 3.81838 16.5992C5.00671 16.6825 5.63171 17.8209 5.63171 17.8209C6.68671 19.6259 8.39838 19.1042 9.07838 18.8025C9.18671 18.0309 9.49671 17.5109 9.83838 17.2142C7.21004 16.9159 4.45004 15.8992 4.45004 11.4159C4.45004 10.1392 4.90671 9.0942 5.65671 8.27086C5.53671 7.97253 5.13838 6.78586 5.77171 5.17919C5.77171 5.17919 6.75504 4.86419 9.04004 6.41086C9.97504 6.15086 10.9934 6.02086 12.0017 6.01586C13.0101 6.02086 14.0284 6.15086 14.9651 6.41086C17.2484 4.86419 18.2301 5.17919 18.2301 5.17919C18.8651 6.78586 18.4667 7.97253 18.3484 8.27086C19.1001 9.0942 19.5534 10.1392 19.5534 11.4159C19.5534 15.9125 16.7884 16.9125 14.1517 17.2042C14.5801 17.5742 14.9634 18.3059 14.9634 19.4225C14.9634 21.0259 14.9484 22.3175 14.9484 22.6842C14.9484 22.9975 15.1617 23.3659 15.7617 23.2492C20.4551 21.6842 23.8334 17.2559 23.8334 12.0335C23.8334 5.49857 18.5351 0.200195 12.0001 0.200195Z" />
                        </svg>
                        GitHub
                    </button>
                </div>

                <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
