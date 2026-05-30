import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';

const getOptimizedSrc = (src, width) => {
    if (src && src.includes('images.unsplash.com')) {
        let optimized = src;
        if (width) {
            // Replace the width parameter
            if (optimized.includes('w=')) {
                optimized = optimized.replace(/w=\d+/, `w=${width}`);
            } else {
                optimized = `${optimized}&w=${width}`;
            }
        }
        // Replace or add format and quality parameters
        if (optimized.includes('q=')) {
            optimized = optimized.replace(/q=\d+/, 'auto=format&fit=crop&q=60');
        } else if (optimized.includes('?')) {
            optimized = `${optimized}&auto=format&fit=crop&q=60`;
        } else {
            optimized = `${optimized}?auto=format&fit=crop&q=60`;
        }
        return optimized;
    }
    return src;
};

const ImageWithFallback = ({ src, alt, className, style, width, height }) => {
    const [imgSrc, setImgSrc] = useState(() => getOptimizedSrc(src, width));
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setImgSrc(getOptimizedSrc(src, width));
        setHasError(false);
    }, [src, width]);

    const handleError = () => {
        setHasError(true);
        setImgSrc('https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=300&auto=format&fit=crop&q=60');
    };

    if (hasError && !imgSrc) {
        return (
            <div className={`flex items-center justify-center ${className || ''}`} style={{ ...style, background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                <Package size={48} />
            </div>
        );
    }

    return (
        <img 
            src={imgSrc} 
            alt={alt} 
            className={className} 
            style={style} 
            onError={handleError}
            loading="lazy"
            decoding="async"
            width={width || "300"}
            height={height || "300"}
        />
    );
};

export default ImageWithFallback;
