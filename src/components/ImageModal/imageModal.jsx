import React from 'react';
import './imageModal.scss';

const ImageModal = ({isOpen, onClose }) =>{
if (!isOpen) return null;

return (
    <div className="image-modal-overlay" onClick={onClose}>






</div>
);
};


export default ImageModal;