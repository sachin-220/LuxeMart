import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Save, Camera, Home, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('personal');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        address: { street: '', city: '', state: '', postalCode: '', country: 'India' },
        homeAddress: { street: '', city: '', state: '', postalCode: '', country: 'India' },
        workAddress: { street: '', city: '', state: '', postalCode: '', country: 'India' }
    });

    useEffect(() => {
        if (!user) {
            navigate('/signin');
        } else {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                address: {
                    street: user.address?.street || '',
                    city: user.address?.city || '',
                    state: user.address?.state || '',
                    postalCode: user.address?.postalCode || '',
                    country: user.address?.country || 'India'
                },
                homeAddress: {
                    street: user.homeAddress?.street || '',
                    city: user.homeAddress?.city || '',
                    state: user.homeAddress?.state || '',
                    postalCode: user.homeAddress?.postalCode || '',
                    country: user.homeAddress?.country || 'India'
                },
                workAddress: {
                    street: user.workAddress?.street || '',
                    city: user.workAddress?.city || '',
                    state: user.workAddress?.state || '',
                    postalCode: user.workAddress?.postalCode || '',
                    country: user.workAddress?.country || 'India'
                }
            });
        }
    }, [user, navigate]);

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const getAvatarColor = (name) => {
        if (!name) return 'var(--primary)';
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (type, field, value) => {
        setFormData(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateProfile(formData);
    };

    if (!user) return null;

    const renderAddressForm = (type, title, icon) => {
        const addressData = formData[type] || { street: '', city: '', state: '', postalCode: '', country: 'India' };
        return (
            <div className="flex-col gap-6">
                <div className="profile-section-title">
                    {icon}
                    <span>{title}</span>
                </div>
                
                <div className="profile-form-grid">
                    <div className="profile-input-wrapper profile-form-full">
                        <label>Street Address</label>
                        <input 
                            type="text" 
                            className="profile-input" 
                            value={addressData.street} 
                            onChange={e => handleAddressChange(type, 'street', e.target.value)} 
                            placeholder="House No, Flat, Street Name" 
                        />
                    </div>

                    <div className="profile-input-wrapper">
                        <label>City</label>
                        <input 
                            type="text" 
                            className="profile-input" 
                            value={addressData.city} 
                            onChange={e => handleAddressChange(type, 'city', e.target.value)} 
                            placeholder="City" 
                        />
                    </div>
                    <div className="profile-input-wrapper">
                        <label>State</label>
                        <input 
                            type="text" 
                            className="profile-input" 
                            value={addressData.state} 
                            onChange={e => handleAddressChange(type, 'state', e.target.value)} 
                            placeholder="State" 
                        />
                    </div>

                    <div className="profile-input-wrapper">
                        <label>ZIP / Postal Code</label>
                        <input 
                            type="text" 
                            className="profile-input" 
                            value={addressData.postalCode} 
                            onChange={e => handleAddressChange(type, 'postalCode', e.target.value)} 
                            placeholder="Pin Code" 
                        />
                    </div>
                    <div className="profile-input-wrapper">
                        <label>Country</label>
                        <input 
                            type="text" 
                            className="profile-input" 
                            value={addressData.country} 
                            onChange={e => handleAddressChange(type, 'country', e.target.value)} 
                            placeholder="Country" 
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="container fade-in" style={{ paddingBottom: '4rem', paddingTop: '2rem', maxWidth: '1100px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '2rem' }}>My Account</h1>

            <div className="profile-container">
                {/* Left Panel: Sidebar */}
                <div className="profile-sidebar">
                    {/* User Profile Summary Card */}
                    <div className="profile-user-card">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar" style={{ background: getAvatarColor(user.name) }}>
                                {getInitials(user.name)}
                            </div>
                            <button className="profile-avatar-upload" aria-label="Upload photo">
                                <Camera size={14} />
                            </button>
                        </div>
                        <div className="profile-user-greeting">
                            <span>Hello,</span>
                            <h4>{user.name}</h4>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="profile-menu-card">
                        <div className="profile-menu-section">
                            <div className="profile-menu-header">
                                <User size={16} style={{ color: 'var(--primary)' }} />
                                <span>Profile Settings</span>
                            </div>
                            <button 
                                type="button"
                                className={`profile-menu-item ${activeTab === 'personal' ? 'active' : ''}`}
                                onClick={() => setActiveTab('personal')}
                            >
                                Personal Details
                            </button>
                            <button 
                                type="button"
                                className={`profile-menu-item ${activeTab === 'address' ? 'active' : ''}`}
                                onClick={() => setActiveTab('address')}
                            >
                                Default Address
                            </button>
                        </div>

                        <div className="profile-menu-section">
                            <div className="profile-menu-header">
                                <MapPin size={16} style={{ color: 'var(--secondary)' }} />
                                <span>Addresses</span>
                            </div>
                            <button 
                                type="button"
                                className={`profile-menu-item ${activeTab === 'homeAddress' ? 'active' : ''}`}
                                onClick={() => setActiveTab('homeAddress')}
                            >
                                Home Address
                            </button>
                            <button 
                                type="button"
                                className={`profile-menu-item ${activeTab === 'workAddress' ? 'active' : ''}`}
                                onClick={() => setActiveTab('workAddress')}
                            >
                                Work Address
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Content Card */}
                <div className="profile-content-card">
                    <form onSubmit={handleSubmit} className="flex-col gap-6">
                        {activeTab === 'personal' && (
                            <div className="flex-col gap-6">
                                <div className="profile-section-title">
                                    <User size={20} style={{ color: 'var(--primary)' }} />
                                    <span>Personal Details</span>
                                </div>

                                <div className="profile-form-grid">
                                    <div className="profile-input-wrapper profile-form-full">
                                        <label>Full Name</label>
                                        <input 
                                            type="text" 
                                            className="profile-input" 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="profile-input-wrapper">
                                        <label>Email Address</label>
                                        <input 
                                            type="email" 
                                            className="profile-input" 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="profile-input-wrapper">
                                        <label>Phone Number</label>
                                        <input 
                                            type="tel" 
                                            className="profile-input" 
                                            name="phoneNumber"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            placeholder="+91 9876543210"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'address' && renderAddressForm('address', 'Default Delivery Address', <MapPin size={20} style={{ color: 'var(--primary)' }} />)}
                        
                        {activeTab === 'homeAddress' && renderAddressForm('homeAddress', 'Home Address', <Home size={20} style={{ color: 'var(--primary)' }} />)}
                        
                        {activeTab === 'workAddress' && renderAddressForm('workAddress', 'Work Address', <Briefcase size={20} style={{ color: 'var(--primary)' }} />)}

                        <div className="profile-actions">
                            <button type="submit" className="btn-premium">
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
