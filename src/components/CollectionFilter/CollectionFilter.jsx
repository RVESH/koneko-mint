// src/components/CollectionFilter/CollectionFilter.jsx
import React from 'react';
import './CollectionFilter.scss';

const CollectionFilter = ({ activeFilter, onFilterChange, counts }) => {
  const filterOptions = [
    {
      id: 'all',
      label: 'All Collection',
      icon: '🎨',
      description: 'View entire NFT collection',
      count: counts?.total || 0,
      color: 'purple'
    },
    {
      id: 'available',
      label: 'Available to Mint',
      icon: '✨',
      description: 'NFTs ready for minting',
      count: counts?.available || 0,
      color: 'green'
    },
    {
      id: 'minted',
      label: 'Already Minted',
      icon: '💎',
      description: 'NFTs owned by collectors',
      count: counts?.minted || 0,
      color: 'blue'
    }
  ];

  return (
    <div className="collection-filter">
      <div className="filter-header">
        <h2>Explore Collection</h2>
        <p>Discover and mint unique digital artworks</p>
      </div>

      <div className="filter-options">
        {filterOptions.map((option) => (
          <div
            key={option.id}
            className={`filter-card ${activeFilter === option.id ? 'active' : ''} ${option.color}`}
            onClick={() => onFilterChange(option.id)}
          >
            <div className="card-header">
              <div className="card-icon">{option.icon}</div>
              <div className="card-count">{option.count}</div>
            </div>

            <div className="card-content">
              <h3 className="card-title">{option.label}</h3>
              <p className="card-description">{option.description}</p>
            </div>

            <div className="card-indicator">
              <div className="indicator-dot"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionFilter;
