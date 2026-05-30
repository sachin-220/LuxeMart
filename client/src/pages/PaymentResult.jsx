import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, ShieldCheck, CreditCard, ChevronRight, Package, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [orderId, setOrderId] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        const statusParam = searchParams.get('status');
        const orderIdParam = searchParams.get('orderId');
        const txnIdParam = searchParams.get('txnId');
        const amtParam = searchParams.get('amount');

        if (statusParam) {
            setStatus(statusParam);
            setOrderId(orderIdParam || '');
            setTransactionId(txnIdParam || '');
            setAmount(amtParam || '');

            // Store in simple local payment history
            if (statusParam === 'success' && orderIdParam) {
                const history = JSON.parse(localStorage.getItem('payment_history')) || [];
                const alreadyRecorded = history.find(h => h.orderId === orderIdParam);
                if (!alreadyRecorded) {
                    history.push({
                        orderId: orderIdParam,
                        txnId: txnIdParam || 'N/A',
                        amount: amtParam || 'N/A',
                        date: new Date().toLocaleString(),
                        status: 'SUCCESS'
                    });
                    localStorage.setItem('payment_history', JSON.stringify(history));
                }
            }
        } else {
            navigate('/products');
        }
    }, [searchParams, navigate]);

    if (!status) return null;

    const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(val || 0));

    return (
        <div className="container fade-in" style={{ padding: '4rem 1.5rem', maxWidth: '600px', margin: '0 auto' }}>
            {status === 'success' ? (
                <div className="glass-panel" style={{ padding: '3rem 2rem', borderTop: '6px solid var(--success)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', marginBottom: '1.5rem' }}>
                        <CheckCircle size={48} />
                    </div>
                    
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Payment Successful!</h1>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Your payment was processed successfully. Thank you for shopping with LuxeMart.
                    </p>

                    <div className="flex-col gap-3" style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        <div className="flex justify-between">
                            <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                            <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>{orderId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: 'var(--text-muted)' }}>Transaction ID:</span>
                            <span style={{ fontWeight: '700', fontFamily: 'monospace' }}>{transactionId}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{formatINR(amount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                            <span style={{ fontWeight: '700', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <ShieldCheck size={16} /> SECURELY PAID
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 flex-wrap">
                        <Link to="/orders" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Package size={18} /> View Orders
                        </Link>
                        <Link to="/products" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Continue Shopping <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '3rem 2rem', borderTop: '6px solid var(--danger)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', marginBottom: '1.5rem' }}>
                        <XCircle size={48} />
                    </div>
                    
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Payment Failed!</h1>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Your payment could not be processed. If money was debited, it will be refunded within 3-5 business days.
                    </p>

                    <div className="flex-col gap-3" style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        <div className="flex gap-2 items-center" style={{ color: '#d97706', fontWeight: '600' }}>
                            <AlertTriangle size={18} /> Re-check card details & try again
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Double check your card number, expiry, and CVV before initiating transaction.
                        </p>
                    </div>

                    <div className="flex justify-center gap-4 flex-wrap">
                        <button onClick={() => navigate(-1)} className="btn btn-outline">
                            Go Back to Checkout
                        </button>
                        <Link to="/cart" className="btn btn-primary">
                            View Shopping Cart
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentResult;
