import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Users, Package, ShoppingBag, DollarSign, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { user, token, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            toast.error('Unauthorized access. Admin only.');
            navigate('/');
        }
        
        // Mock fetch stats (In real app, fetch from /api/admin/stats)
        setStats({
            totalRevenue: 245900,
            totalOrders: 154,
            totalProducts: 240,
            totalUsers: 89
        });
    }, [user, navigate]);

    if (!user || user.role !== 'admin') return null;

    const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="container fade-in" style={{ padding: '2rem 1rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Admin Dashboard</h1>
                <div className="flex gap-4">
                    <Link to="/admin/products" className="btn btn-primary">Manage Products</Link>
                    <Link to="/admin/orders" className="btn btn-outline">Manage Orders</Link>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {/* Revenue Card */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Revenue</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatINR(stats.totalRevenue)}</div>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--success)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Orders</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.totalOrders}</div>
                    </div>
                </div>

                {/* Products Card */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--warning)' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Products</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.totalProducts}</div>
                    </div>
                </div>

                {/* Users Card */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #ec4899' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Users</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stats.totalUsers}</div>
                    </div>
                </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={20} style={{ color: 'var(--primary)' }} /> Recent Activity
                    </h2>
                    <div className="flex-col gap-4">
                        <p style={{ color: 'var(--text-muted)' }}>Real-time analytical charts and recent order logs will appear here as orders are placed.</p>
                    </div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>System Status</h2>
                    <ul className="flex-col gap-3" style={{ fontSize: '0.875rem' }}>
                        <li className="flex justify-between items-center border-b pb-2">
                            <span>Database</span>
                            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Connected</span>
                        </li>
                        <li className="flex justify-between items-center border-b pb-2">
                            <span>Cloudinary Storage</span>
                            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Active</span>
                        </li>
                        <li className="flex justify-between items-center border-b pb-2">
                            <span>Razorpay Gateway</span>
                            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Test Mode</span>
                        </li>
                        <li className="flex justify-between items-center border-b pb-2">
                            <span>Node Server</span>
                            <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Running</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <style>{`
                @media (max-width: 768px) {
                    .grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
