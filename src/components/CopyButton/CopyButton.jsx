// src/components/CopyButton/CopyButton.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './CopyButton.scss';

function CopyButton({ value, label = 'Copy', copiedLabel = 'Copied!', className = '' }) {
  const [isCopied, setIsCopied] = useState(false);

  const truncate = (s) =>
    s && s.length > 10 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s;

  const fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        fallbackCopy(value);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (err) {
      fallbackCopy(value);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    }
  };

  return (
    <div className={`copy-wrapper ${className}`}>
      <span className="copy-trunc">{truncate(value)}</span>
      <button
        className="copy-btn"
        onClick={handleCopy}
        aria-label={isCopied ? copiedLabel : label}
        type="button"
      >
        {isCopied ? copiedLabel : label}
      </button>
    </div>
  );
}

CopyButton.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string,
  copiedLabel: PropTypes.string,
  className: PropTypes.string,
};

export default CopyButton;
