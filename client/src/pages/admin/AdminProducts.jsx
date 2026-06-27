import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Package, Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProducts = () => {
    const { token } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const initialFormState = {
        _id: null, title: '', description: '', price: '', category: '', image: '', brand: '', stock: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/products?limit=50`);
            const data = await res.json();
            if (data.products) setProducts(data.products);
        } catch (err) {
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataImg = new FormData();
        formDataImg.append('image', file);

        setUploadingImage(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formDataImg
            });
            const data = await res.json();
            if (data.success) {
                setFormData({ ...formData, image: data.url });
                toast.success('Image uploaded successfully via Cloudinary');
            } else {
                toast.error(data.message || 'Upload failed');
            }
        } catch (err) {
            toast.error('Image upload failed');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isEditing = !!formData._id;
        const url = isEditing 
            ? `${import.meta.env.VITE_API_URL}/admin/products/${formData._id}` 
            : `${import.meta.env.VITE_API_URL}/admin/products`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                toast.success(isEditing ? 'Product updated' : 'Product created');
                fetchProducts();
                setShowModal(false);
                setFormData(initialFormState);
            } else {
                toast.error(data.message || 'Failed to save product');
            }
        } catch (err) {
            toast.error('Failed to save product');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Product deleted');
                setProducts(products.filter(p => p._id !== id));
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error('Failed to delete product');
        }
    };

    const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="container fade-in" style={{ padding: '2rem 1rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={32} style={{ color: 'var(--warning)' }} /> Manage Products
                </h1>
                <button className="btn btn-primary flex items-center gap-2" onClick={() => { setFormData(initialFormState); setShowModal(true); }}>
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}><div className="spinner"></div></div>
            ) : (
                <div className="table-responsive glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)' }}>
                    <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-subtle)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Image</th>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Title</th>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Price</th>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Category</th>
                                <th style={{ padding: '1rem', fontWeight: '600', fontSize: '0.875rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <img src={product.image} alt={product.title} loading="lazy" decoding="async" style={{ width: '50px', height: '50px', objectFit: 'contain', background: 'white', borderRadius: '4px' }} />
                                    </td>
                                    <td style={{ padding: '1rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {product.title}
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: '600' }}>{formatINR(product.price)}</td>
                                    <td style={{ padding: '1rem' }}>{product.category}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div className="flex gap-2">
                                            <button className="btn btn-outline btn-sm" style={{ padding: '0.5rem' }} onClick={() => { setFormData(product); setShowModal(true); }}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="btn btn-outline btn-sm" style={{ padding: '0.5rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(product._id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem', background: 'var(--bg-body)', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' }}>
                            {formData._id ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="flex-col gap-4">
                            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Title</label>
                                    <input type="text" className="input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Description</label>
                                    <textarea className="input" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Price (INR)</label>
                                    <input type="number" className="input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Category</label>
                                    <input type="text" className="input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Brand</label>
                                    <input type="text" className="input" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Stock</label>
                                    <input type="number" className="input" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                                </div>
                                
                                <div style={{ gridColumn: '1 / -1', background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                                    <label style={{ display: 'block', marginBottom: '1rem', fontSize: '0.875rem', fontWeight: '600' }}>Product Image (Cloudinary)</label>
                                    <div className="flex gap-4 items-center">
                                        {formData.image && (
                                            <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '4px', padding: '4px', border: '1px solid var(--border-color)' }}>
                                                <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            </div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <input type="file" id="imageUpload" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                            <label htmlFor="imageUpload" className="btn btn-outline flex items-center justify-center gap-2" style={{ cursor: 'pointer', width: '100%' }}>
                                                <ImageIcon size={18} /> {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                            </label>
                                        </div>
                                    </div>
                                    {!formData.image && !uploadingImage && <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>No image uploaded yet.</div>}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={uploadingImage}>
                                    {formData._id ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
