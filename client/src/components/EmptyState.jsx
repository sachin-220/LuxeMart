import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ icon: Icon, title, description, actionText, actionLink = '/products' }) => {
    return (
        <div className="empty-state fade-in" style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', margin: '2rem 0' }}>
            <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '50%', background: 'var(--bg-subtle)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <Icon size={48} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>{title}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem auto' }}>{description}</p>
            {actionText && (
                <Link to={actionLink} className="btn btn-primary">
                    {actionText}
                </Link>
            )}
        </div>
    );
};

export default EmptyState;
