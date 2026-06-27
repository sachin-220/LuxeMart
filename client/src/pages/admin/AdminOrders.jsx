import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Truck, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const { token } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setOrders(data.data);
            }
        } catch (err) {
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateShipment = async (orderId, newStage) => {
        setUpdatingId(orderId);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/orders/${orderId}/shipment`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ shipmentStage: newStage })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Order updated to ${newStage}`);
                setOrders(orders.map(o => o._id === orderId ? data.data : o));
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error('Failed to update shipment');
        } finally {
            setUpdatingId(null);
        }
    };

    const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="container fade-in" style={{ padding: '2rem 1rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Truck size={32} style={{ color: 'var(--primary)' }} /> Order Management
            </h1>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}><div className="spinner"></div></div>
            ) : orders.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>No orders found.</div>
            ) : (
                <div className="table-responsive glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
                    <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-subtle)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Order ID</th>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>User</th>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Date</th>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Total</th>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Payment</th>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Shipment Stage</th>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                                    <td style={{ padding: '1rem' }}>{order._id.substring(0, 8)}...</td>
                                    <td style={{ padding: '1rem' }}>{order.user?.name || 'Guest'}<br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user?.email}</span></td>
                                    <td style={{ padding: '1rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem', fontWeight: '600' }}>{formatINR(order.totalPrice)}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: order.isPaid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: order.isPaid ? 'var(--success)' : 'var(--warning)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                            {order.isPaid ? 'PAID' : 'PENDING'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: '600', color: order.shipmentStage === 'Delivered' ? 'var(--success)' : 'inherit' }}>
                                        {order.shipmentStage}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <select 
                                            className="input" 
                                            style={{ padding: '0.5rem', fontSize: '0.75rem', width: 'auto' }}
                                            value={order.shipmentStage}
                                            onChange={(e) => handleUpdateShipment(order._id, e.target.value)}
                                            disabled={updatingId === order._id || order.shipmentStage === 'Delivered' || order.shipmentStage === 'Cancelled'}
                                        >
                                            <option value="Ordered">Ordered</option>
                                            <option value="Packed">Packed</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Out for Delivery">Out for Delivery</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
