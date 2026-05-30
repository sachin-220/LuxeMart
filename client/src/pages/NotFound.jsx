import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="container empty-state" style={{ padding: '100px 20px' }}>
            <h1 style={{ fontSize: '4rem', color: 'var(--primary-color)', marginBottom: '20px' }}>404</h1>
            <h2>Page Not Found</h2>
            <p>The page you are looking for doesn't exist or has been moved.</p>
            <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px' }}>
                Go to Homepage
            </Link>
        </div>
    );
};

export default NotFound;
