import React from 'react';
import './imageModal.scss';

const ImageModal = ({ nft, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="image-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="image-modal-frame">
        <button className="image-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="image-modal-inner">
          <img
            src={`/room/images/${nft.filename}`}
            alt={nft.name || `NFT #${nft.id}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
