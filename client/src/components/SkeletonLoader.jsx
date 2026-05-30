import React from 'react';

export const ProductSkeleton = () => (
  <div className="product-card glass-panel" style={{ height: '470px' }}>
    <div className="skeleton" style={{ height: '240px', width: '100%', borderBottom: '1px solid var(--border-color)' }}></div>
    <div className="product-info gap-2" style={{ padding: '1.5rem' }}>
      <div className="skeleton" style={{ height: '14px', width: '30%', borderRadius: '4px' }}></div>
      <div className="skeleton" style={{ height: '20px', width: '80%', borderRadius: '4px' }}></div>
      <div className="skeleton" style={{ height: '24px', width: '40%', borderRadius: '4px', marginTop: 'auto' }}></div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="product-grid">
    {Array(count).fill(0).map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </div>
);

export const ProductDetailsSkeleton = () => (
  <div className="container" style={{ padding: '2rem 0' }}>
    <div className="skeleton" style={{ height: '20px', width: '200px', marginBottom: '2rem', borderRadius: '4px' }}></div>
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
      <div className="skeleton" style={{ height: '400px', width: '100%', borderRadius: 'var(--radius-lg)' }}></div>
      <div className="flex-col gap-4">
        <div className="skeleton" style={{ height: '40px', width: '80%', borderRadius: '4px' }}></div>
        <div className="skeleton" style={{ height: '20px', width: '30%', borderRadius: '4px' }}></div>
        <div className="skeleton" style={{ height: '30px', width: '40%', borderRadius: '4px', marginTop: '1rem' }}></div>
        <div className="skeleton" style={{ height: '100px', width: '100%', borderRadius: '4px', marginTop: '1rem' }}></div>
        <div className="skeleton" style={{ height: '50px', width: '100%', borderRadius: 'var(--radius-full)', marginTop: '2rem' }}></div>
      </div>
    </div>
  </div>
);
