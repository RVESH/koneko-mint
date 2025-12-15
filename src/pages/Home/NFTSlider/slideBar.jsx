import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./slideBar.scss";

const NFTSlider = ({ onZoomClick }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/room/metadata.json")
      .then((res) => res.json())
      .then((data) => {
        setNfts(data.slice(0, 20));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading JSON:", err);
        setLoading(false);
      });
  }, []);

  // ✅ Check scroll position for arrow visibility
  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", checkScroll);
      checkScroll(); // Initial check
      return () => slider.removeEventListener("scroll", checkScroll);
    }
  }, [nfts]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const handleNFTClick = (e, nft) => {
    e.preventDefault();
    e.stopPropagation();
    if (onZoomClick) {
      onZoomClick(nft.id);
    } else {
      navigate(`/RandomMint`);
    }
  };

  if (loading) {
    return (
      <div className="nft-slider-loading">
        <div className="loader"></div>
        <p>Loading NFTs...</p>
      </div>
    );
  }

  return (
    <div className="nft-slider-container">
      {/* Left Arrow */}
      <button
        className={`slider-arrow arrow-left ${!canScrollLeft ? "disabled" : ""}`}
        onClick={scrollLeft}
        aria-label="Previous NFTs"
        disabled={!canScrollLeft}
      >
        <span>‹</span>
      </button>

      {/* Slider Wrapper */}
      <div className="nft-slider-wrapper">
        <div className="nft-slider" ref={sliderRef}>
          {nfts.map((nft, index) => (
            <div
              key={nft.id}
              className="nft-slide"
              onClick={(e) => handleNFTClick(e, nft)}
              style={{ "--slide-index": index }}
            >
              {/* Card Inner */}
              <div className="nft-card-inner">
                {/* Image Container */}
                <div className="nft-image-container">
                  <img
                    src={`/room/images/${nft.filename}`}
                    alt={nft.name || `NFT #${nft.id}`}
                    loading="lazy"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="nft-overlay">
                    <div className="nft-overlay-content">
                      <span className="view-tag">👀 View Details</span>
                      <span className="arrow-icon">→</span>
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="nft-badge">#{nft.id}</div>
                </div>

                {/* Info Section */}
                <div className="nft-info">
                  <h4 className="nft-name">{nft.name || `NFT #${nft.id}`}</h4>
                  <div className="nft-footer">
                    <span className="nft-price">{nft.price || '0.002'} OP</span>
                    <span className="nft-action">Mint →</span>
                  </div>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="nft-glow"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Arrow */}
      <button
        className={`slider-arrow arrow-right ${!canScrollRight ? "disabled" : ""}`}
        onClick={scrollRight}
        aria-label="Next NFTs"
        disabled={!canScrollRight}
      >
        <span>›</span>
      </button>
    </div>
  );
};

export default NFTSlider;
