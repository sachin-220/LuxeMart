import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, Package, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const Invoice = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
                    headers: { 
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}` 
                    }
                });
                const data = await res.json();
                if (data.success) {
                    setOrder(data.data);
                } else {
                    setError(data.message || 'Failed to fetch invoice details.');
                }
            } catch (err) {
                console.error("Error fetching order:", err);
                setError('Network error: Could not reach the server.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        const input = document.getElementById('invoice-document-capture');
        if (!input) {
            toast.error("Invoice document element not found");
            return;
        }

        const toastId = toast.loading("Generating high-quality PDF...");

        html2canvas(input, {
            scale: 2, // High resolution capture
            useCORS: true,
            backgroundColor: '#ffffff'
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 page width in mm
            const pageHeight = 297; // A4 page height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`LuxeMart-Invoice-${order?._id || 'order'}.pdf`);
            toast.success("PDF Downloaded successfully!", { id: toastId });
        }).catch((err) => {
            console.error("PDF generation failed:", err);
            toast.error("Failed to generate PDF.", { id: toastId });
        });
    };

    if (loading) {
        return (
            <div className="container" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid var(--border-color)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem'
                }}></div>
                <p style={{ color: 'var(--text-muted)' }}>Loading invoice details...</p>
                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>Invoice Not Found</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || "We couldn't find the invoice details for this order."}</p>
                <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
            </div>
        );
    }

    const formatINR = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);

    const orderIdStr = order?._id ? order._id.toString() : '';
    const invoiceNo = orderIdStr ? `INV-${orderIdStr.substring(Math.max(0, orderIdStr.length - 6)).toUpperCase()}` : 'INV-UNKNOWN';
    const invoiceDate = new Date(order?.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    const transactionId = order?.paymentResult?.razorpayPaymentId || (orderIdStr ? `TXN-${orderIdStr.substring(Math.max(0, orderIdStr.length - 8)).toUpperCase()}` : 'TXN-UNKNOWN');
    
    // Tax breakdown calculation
    const taxRate = 0.18; // 18% GST included
    const totalAmount = order?.totalPrice || 0;
    const shipping = order?.shippingPrice || 0;
    const membershipSavings = order?.membershipSavings || 0;
    const taxableItemsTotal = totalAmount - shipping;
    const subtotalExcludeTax = taxableItemsTotal / (1 + taxRate);
    const calculatedGST = taxableItemsTotal - subtotalExcludeTax;

    return (
        <div className="container fade-in" style={{ paddingBottom: '4rem', paddingTop: '2rem' }}>
            {/* Header / Actions toolbar */}
            <div className="no-print flex justify-between items-center" style={{ marginBottom: '2rem', maxWidth: '850px', margin: '0 auto 2rem auto' }}>
                <Link to="/orders" className="hover:text-primary flex items-center gap-1" style={{ fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <ArrowLeft size={16} /> Back to Orders
                </Link>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handlePrint} className="btn btn-outline flex items-center gap-2" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                        <Printer size={16} /> Print Invoice
                    </button>
                    <button onClick={handleDownloadPDF} className="btn btn-primary flex items-center gap-2" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                        <Download size={16} /> Download PDF
                    </button>
                </div>
            </div>

            {/* Document area */}
            <div className="invoice-document-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                <div 
                    id="invoice-document-capture" 
                    className="invoice-document" 
                    style={{ 
                        padding: '3.5rem', 
                        background: '#ffffff', 
                        color: '#1e293b', 
                        width: '100%', 
                        maxWidth: '850px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                        borderRadius: '12px',
                        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
                    }}
                >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '2px solid #f1f5f9', paddingBottom: '2.5rem', marginBottom: '2.5rem' }}>
                        <div style={{ flexGrow: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <div style={{ background: '#4f46e5', color: '#ffffff', padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                                    <Package size={22} />
                                </div>
                                <span style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.025em', color: '#0f172a' }}>LuxeMart</span>
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                <strong>LuxeMart E-Commerce Services Pvt. Ltd.</strong><br />
                                Building 4A, Tech World, Outer Ring Road<br />
                                Bengaluru, Karnataka - 560103<br />
                                <strong>GSTIN:</strong> 29ABCDE1234F1Z5
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: '220px' }}>
                            <span style={{ 
                                display: 'inline-block',
                                background: 'rgba(79, 70, 229, 0.08)',
                                color: '#4f46e5',
                                fontWeight: '700',
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                textTransform: 'uppercase',
                                marginBottom: '0.75rem'
                            }}>
                                Tax Invoice
                            </span>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>
                                <div style={{ color: '#0f172a', fontWeight: '700' }}>Invoice No: {invoiceNo}</div>
                                <div><strong>Date:</strong> {invoiceDate}</div>
                                <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}><strong>Order ID:</strong> #{order?._id}</div>
                                <div style={{ fontSize: '0.75rem' }}><strong>Transaction ID:</strong> {transactionId}</div>
                            </div>
                        </div>
                    </div>

                    {/* Customer & Shipping / Seller Details Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                        <div>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem' }}>
                                Billed To (Customer):
                            </h4>
                            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>
                                <strong style={{ color: '#0f172a' }}>{order?.user?.name || 'Customer'}</strong><br />
                                {order?.user?.email && <span>{order.user.email}<br /></span>}
                                {order?.user?.phoneNumber && <span>Ph: {order.user.phoneNumber}<br /></span>}
                            </div>
                        </div>
                        
                        <div>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem' }}>
                                Shipping Address:
                            </h4>
                            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>
                                <strong style={{ color: '#0f172a' }}>{order?.user?.name || 'Customer'}</strong><br />
                                {order?.shippingAddress?.address}<br />
                                {order?.shippingAddress?.city}, {order?.shippingAddress?.postalCode}<br />
                                {order?.shippingAddress?.country || 'India'}
                            </div>
                        </div>

                        <div>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.25rem' }}>
                                Dispatch Details:
                            </h4>
                            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>
                                <strong>Seller:</strong> LuxeMart Retail Pvt Ltd<br />
                                <strong>Courier Partner:</strong> {order?.courierPartner || 'LuxeMart Express'}<br />
                                <strong>Shipment Hub:</strong> {order?.shipmentHub || 'Bengaluru Fulfillment Hub'}<br />
                                <strong>Payment Method:</strong> {order?.paymentMethod || 'Razorpay'}
                            </div>
                        </div>
                    </div>

                    {/* Products Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2.5rem' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', color: '#334155', fontSize: '0.8rem', textTransform: 'uppercase' }}>Items & Description</th>
                                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700', color: '#334155', fontSize: '0.8rem', textTransform: 'uppercase', width: '80px' }}>Qty</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#334155', fontSize: '0.8rem', textTransform: 'uppercase', width: '120px' }}>Unit Price</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '700', color: '#334155', fontSize: '0.8rem', textTransform: 'uppercase', width: '140px' }}>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(order?.orderItems || []).map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                            Seller: LuxeMart Retail | HSN: {4800 + idx}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 1rem', textAlign: 'center', color: '#334155', fontSize: '0.9rem' }}>{item.qty}</td>
                                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right', color: '#334155', fontSize: '0.9rem' }}>{formatINR(item.price)}</td>
                                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right', fontWeight: '700', color: '#0f172a', fontSize: '0.9rem' }}>
                                        {formatINR(item.price * item.qty)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals & Tax Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', padding: '1.5rem 0', borderTop: '2px solid #f1f5f9' }}>
                        <div style={{ flex: 1, minWidth: '240px' }}>
                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', fontSize: '0.8rem', color: '#475569', lineHeight: '1.6' }}>
                                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.5rem' }}>Tax & Membership Analysis:</strong>
                                <div>• GST Breakdown: CGST (9%) + SGST (9%) Included.</div>
                                <div>• Total Taxable Amount: {formatINR(subtotalExcludeTax)}</div>
                                <div>• Total GST Calculated: {formatINR(calculatedGST)}</div>
                                {membershipSavings > 0 && (
                                    <div style={{ color: '#16a34a', fontWeight: '700', marginTop: '0.5rem' }}>
                                        🎉 Luxe {order?.membershipPlan || 'Premium'} benefits saved you {formatINR(membershipSavings)} on delivery!
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ width: '320px', marginLeft: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.9rem', color: '#475569' }}>
                                <span>Subtotal (Excl. Tax):</span>
                                <span>{formatINR(subtotalExcludeTax)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.9rem', color: '#475569' }}>
                                <span>GST (18% Included):</span>
                                <span>{formatINR(calculatedGST)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.9rem', color: '#475569' }}>
                                <span>Delivery Charges:</span>
                                <span>{shipping === 0 ? 'FREE' : formatINR(shipping)}</span>
                            </div>
                            {membershipSavings > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.9rem', color: '#16a34a', fontWeight: '600' }}>
                                    <span>Membership Savings:</span>
                                    <span>-{formatINR(membershipSavings)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderTop: '1px solid #cbd5e1', marginTop: '0.5rem', fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                                <span>Grand Total:</span>
                                <span>{formatINR(totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Row */}
                    <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '2rem', marginTop: '2.5rem', textAlign: 'center' }}>
                        <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>
                            Thank you for shopping with LuxeMart!
                        </h4>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', lineHeight: '1.5', maxWidth: '600px', margin: '0 auto' }}>
                            This is a computer-generated tax invoice. No signature is required. For any inquiries, returns, or support, please visit your account dashboard or write to us at <strong style={{ color: '#4f46e5' }}>support@luxemart.com</strong>. Toll-Free Customer Helpline: <strong>1800-123-4567</strong>.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #invoice-document-capture, #invoice-document-capture * { visibility: visible; }
                    #invoice-document-capture { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        border: none !important; 
                        box-shadow: none !important; 
                        margin: 0 !important; 
                        padding: 0 !important; 
                    }
                    .no-print { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default Invoice;
