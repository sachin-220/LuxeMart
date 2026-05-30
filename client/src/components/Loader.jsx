import React from 'react';

const Loader = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <div style={{
                width: '3rem',
                height: '3rem',
                border: '4px solid var(--border-color)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }}>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Loader;
