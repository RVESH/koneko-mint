import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./slideBar.scss";

const NFTSlider = ({ onZoomClick }) => { // Accept onZoomClick prop
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/room/metadata.json")
      .then((res) => res.json())
      .then((data) => {
        setNfts(data.slice(0, 12)); // Show only first 12 NFTs
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading JSON:", err);
        setLoading(false);
      });
  }, []);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  // Handle NFT click - show popup instead of navigate
  const handleNFTClick = (e, nft) => {
    e.preventDefault();
    e.stopPropagation();

    if (onZoomClick) {
      onZoomClick(nft.id); // Call the popup function
    } else {
      // Fallback to navigation if no popup handler
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
    <div className="nft-slider-wrapper">
      <button
        className="slider-arrow arrow-left"
        onClick={scrollLeft}
        aria-label="Previous NFTs"
      >
        ‹
      </button>

      <div className="nft-slider" ref={sliderRef}>
        {nfts.map((nft) => (
          <div
            key={nft.id}
            className="nft-slide"
            onClick={(e) => handleNFTClick(e, nft)} // Pass event and nft object
          >
            <div className="nft-image-container">
              <img
                src={`/room/images/${nft.filename}`}
                alt={nft.name || `NFT #${nft.id}`}
                loading="lazy"
              />
              <div className="nft-overlay">
                <span className="mint-tag">View Details</span> {/* Change text */}
              </div>
            </div>
            <div className="nft-info">
              <h4>{nft.name || `NFT #${nft.id}`}</h4>
              <p className="nft-price">{nft.price || '0.002'} OP</p>
            </div>
          </div>
        ))}
      </div>

      <button
        className="slider-arrow arrow-right"
        onClick={scrollRight}
        aria-label="Next NFTs"
      >
        ›
      </button>
    </div>
  );
};

export default NFTSlider;
