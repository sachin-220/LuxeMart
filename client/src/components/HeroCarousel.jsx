import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useScreenSize } from '../hooks/useMediaQuery';

const banners = [
    {
        id: 1,
        title: "Next-Gen Tech is Here",
        subtitle: "Upgrade your setup with our latest collection of premium electronics.",
        tag: "Electronics Super Sale",
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200&q=80",
        category: "Electronics",
        bgGradient: "linear-gradient(90deg, #1e293b 0%, #0f172a 100%)",
        buttonText: "Shop Electronics"
    },
    {
        id: 2,
        title: "Summer Fashion Refresh",
        subtitle: "Discover the latest trends and redefine your seasonal wardrobe.",
        tag: "Fashion Week Exclusives",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80",
        category: "Fashion",
        bgGradient: "linear-gradient(90deg, #ec4899 0%, #be185d 100%)",
        buttonText: "Explore Fashion"
    },
    {
        id: 3,
        title: "Level Up Your Game",
        subtitle: "Experience unparalleled performance with top-tier gaming gear.",
        tag: "Gaming Deals",
        image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200&q=80",
        category: "Gaming",
        bgGradient: "linear-gradient(90deg, #8b5cf6 0%, #5b21b6 100%)",
        buttonText: "Upgrade Gear"
    },
    {
        id: 4,
        title: "Timeless Elegance",
        subtitle: "Find the perfect timepiece that matches your unique style.",
        tag: "Luxury Watches",
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=1200&q=80",
        category: "Watches",
        bgGradient: "linear-gradient(90deg, #334155 0%, #0f172a 100%)",
        buttonText: "Shop Watches"
    },
    {
        id: 5,
        title: "Radiant Beauty Essentials",
        subtitle: "Glow from within using our carefully curated beauty products.",
        tag: "Beauty Fest",
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80",
        category: "Beauty",
        bgGradient: "linear-gradient(90deg, #f43f5e 0%, #be123c 100%)",
        buttonText: "Discover Beauty"
    },
    {
        id: 6,
        title: "Modernize Your Space",
        subtitle: "Transform your home with contemporary decor and furniture.",
        tag: "Home Makeover",
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80",
        category: "Home Decor",
        bgGradient: "linear-gradient(90deg, #10b981 0%, #047857 100%)",
        buttonText: "Shop Home Decor"
    }
];

const HeroCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();
    const { isMobile, isTablet } = useScreenSize();
    
    // Determine image width based on screen size
    const imageWidth = isMobile ? 600 : (isTablet ? 900 : 1200);
    const getResponsiveImageUrl = (url) => {
        let optimized = url.replace('w=1200', `w=${imageWidth}`);
        if (optimized.includes('q=80')) {
            optimized = optimized.replace('q=80', 'auto=format&fit=crop&q=60');
        }
        return optimized;
    };

    const renderBannerImage = (banner, index) => {
        const baseUrl = banner.image.split('?')[0];
        const src360 = `${baseUrl}?w=360&auto=format&fit=crop&q=60`;
        const src640 = `${baseUrl}?w=640&auto=format&fit=crop&q=60`;
        const src800 = `${baseUrl}?w=800&auto=format&fit=crop&q=65`;
        const src800d = `${baseUrl}?w=800&auto=format&fit=crop&q=70`;
        const src1200 = `${baseUrl}?w=1200&auto=format&fit=crop&q=80`;

        return (
            <picture style={{ width: '100%', height: '100%', display: 'block' }}>
                <source 
                    media="(max-width: 768px)" 
                    srcSet={`${src360} 360w, ${src640} 640w, ${src800} 800w`} 
                    sizes="100vw"
                />
                <source 
                    media="(min-width: 769px)" 
                    srcSet={`${src800d} 800w, ${src1200} 1200w`} 
                    sizes="(max-width: 1024px) 800px, 1200px"
                />
                <img 
                    src={src1200}
                    alt={banner.title} 
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    decoding={index === 0 ? "sync" : "async"}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
            </picture>
        );
    };

    // Preload only current and next slide banner images
    useEffect(() => {
        const currentSrc = getResponsiveImageUrl(banners[currentIndex].image);
        const nextSrc = getResponsiveImageUrl(banners[(currentIndex + 1) % banners.length].image);
        
        const imgCurrent = new Image();
        imgCurrent.src = currentSrc;
        
        const imgNext = new Image();
        imgNext.src = nextSrc;
    }, [currentIndex, imageWidth]);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, []);

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
    };

    useEffect(() => {
        if (!isHovered) {
            const timer = setInterval(nextSlide, 4000);
            return () => clearInterval(timer);
        }
    }, [isHovered, nextSlide]);

    return (
        <section 
            className="hero-carousel-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ 
                position: 'relative', 
                borderRadius: 'var(--radius-lg)', 
                overflow: 'hidden',
                minHeight: '400px',
                display: 'flex',
                boxShadow: 'var(--shadow-md)'
            }}
        >
            {banners.map((banner, index) => {
                const isCurrent = index === currentIndex;
                const isNext = index === (currentIndex + 1) % banners.length;
                const isPrev = index === (currentIndex === 0 ? banners.length - 1 : currentIndex - 1);
                const shouldRender = isCurrent || isNext || isPrev;

                if (!shouldRender) return null;

                return (
                    <div 
                        key={banner.id}
                        className="hero-slide"
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            opacity: isCurrent ? 1 : 0,
                            transition: 'opacity 0.8s ease-in-out',
                            background: banner.bgGradient,
                            display: 'flex',
                            zIndex: isCurrent ? 10 : 0,
                            pointerEvents: isCurrent ? 'auto' : 'none'
                        }}
                    >
                        {/* Background Image for Mobile */}
                        {isMobile ? (
                            (isCurrent || isNext) && (
                                <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8))', zIndex: 2 }}></div>
                                    {renderBannerImage(banner, index)}
                                </div>
                            )
                        ) : (
                            <div className="desktop-only" style={{ flex: 1, position: 'relative' }}>
                                <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, background: `linear-gradient(90deg, ${banner.bgGradient.split(',')[1].trim()} 0%, transparent 100%)`, zIndex: 2 }}></div>
                                {renderBannerImage(banner, index)}
                            </div>
                        )}

                        <div style={{ flex: 1, padding: '4rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, color: 'white' }}>
                            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', padding: '0.25rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', marginBottom: '1rem', backdropFilter: 'blur(4px)', width: 'fit-content' }}>
                                {banner.tag}
                            </div>
                            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.1', color: 'white' }}>
                                {banner.title}
                            </h1>
                            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.85)', marginBottom: '2rem', maxWidth: '500px', lineHeight: '1.5' }}>
                                {banner.subtitle}
                            </p>
                            <button 
                                onClick={() => navigate(`/products?category=${banner.category}`)} 
                                className="btn" 
                                style={{ width: 'fit-content', padding: '0.875rem 2rem', fontSize: '1.125rem', borderRadius: 'var(--radius-full)', background: 'white', color: '#000', border: 'none', fontWeight: '600', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                            >
                                {banner.buttonText}
                            </button>
                        </div>
                    </div>
                );
            })}

            {/* Navigation Arrows */}
            <button 
                onClick={prevSlide}
                className="carousel-control"
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                aria-label="Previous slide"
            >
                <ChevronLeft size={24} />
            </button>
            <button 
                onClick={nextSlide}
                className="carousel-control"
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 20, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                aria-label="Next slide"
            >
                <ChevronRight size={24} />
            </button>

            {/* Pagination Dots */}
            <div style={{ position: 'absolute', bottom: '1.5rem', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '0.5rem', zIndex: 20 }}>
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        style={{
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            margin: 0
                        }}
                        aria-label={`Go to slide ${index + 1}`}
                    >
                        <span style={{
                            width: index === currentIndex ? '20px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            background: index === currentIndex ? 'white' : 'rgba(255,255,255,0.4)',
                            transition: 'all 0.3s ease'
                        }} />
                    </button>
                ))}
            </div>

            <style>{`
                .carousel-control:hover { background: rgba(255,255,255,0.4) !important; }
                @media (max-width: 768px) {
                    .hero-carousel-container { min-height: 350px !important; }
                    .hero-slide { background-size: cover !important; background-position: center !important; }
                }
            `}</style>
        </section>
    );
};

export default HeroCarousel;
