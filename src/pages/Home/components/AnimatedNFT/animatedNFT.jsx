import React, { useState, useEffect } from 'react';
import './animatedNFT.scss';

// ✅ Import all 4 koneko images (app-store.png को हटा दिया)
import koneko1 from '../../../../images/koneko.png';
import koneko2 from '../../../../images/koneko(1).png';
import koneko3 from '../../../../images/koneko(2).png';
import koneko4 from '../../../../images/koneko(3).png';

const AnimatedNFT = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // ✅ 4 images array
  const nftImages = [
    { id: 1, src: koneko1, alt: 'Koneko Character 1' },
    { id: 2, src: koneko2, alt: 'Koneko Character 2' },
    { id: 3, src: koneko3, alt: 'Koneko Character 3' },
    { id: 4, src: koneko4, alt: 'Koneko Character 4' },
  ];

  // ✅ Auto-rotate every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % nftImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [nftImages.length]);

  // ✅ Manual navigation
  const goToSlide = (index) => setActiveIndex(index);

  return (
    <div className="animated-nft-container">
      {/* Main Carousel */}
      <div className="nft-carousel">
        {/* Images with staggered animation */}
        <div className="carousel-wrapper">
          {nftImages.map((nft, index) => (
            <div
              key={nft.id}
              className={`carousel-slide ${
                index === activeIndex ? 'active' : ''
              } carousel-position-${index}`}
            >
              <img
                src={nft.src}
                alt={nft.alt}
                className="carousel-image"
              />
            </div>
          ))}
        </div>

        {/* Glow effect behind active image */}
        <div className="carousel-glow"></div>
      </div>

      {/* Dots Navigation */}
      <div className="carousel-dots">
        {nftImages.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Counter */}
      <div className="carousel-counter">
        {activeIndex + 1} / {nftImages.length}
      </div>
    </div>
  );
};

export default AnimatedNFT;
