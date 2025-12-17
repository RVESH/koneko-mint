import React from 'react';
import './Roadmap.scss';

const Roadmap = () => {
  const phases = [
    {
      id: 1,
      title: 'Foundation & Mint',
      // month: 'Q4 2024',
      icon: '🚀',
      items: [
        'Launch of 12,000 unique NFTs',
        'Fully revealed artwork (no fake previews)',
        'Fair & public mint on Optimism',
        'Smart contract deployed & verified',
        'Secure minting with no hidden functions'
      ],
      status: 'active'
    },
    {
      id: 2,
      title: 'Community First',
      // month: 'Q1 2025',
      icon: '🌱',
      items: [
        'Exclusive holder Discord roles',
        'Holder-only announcements',
        'Transparent updates & progress sharing',
        'Social & community engagement events'
      ],
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Holder Utility',
      // month: 'Q2 2025',
      icon: '🎁',
      items: [
        'Exclusive access for NFT holders',
        'Future drops or rewards for holders',
        'Random mint / rarity-based features',
        'Access to upcoming features & experiments'
      ],
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Long-term Vision',
      // month: 'Q3+ 2025',
      icon: '🔮',
      items: [
        'Sustainable ecosystem development',
        'Partnerships & collaborations (when aligned)',
        'Marketplace & platform improvements',
        'Continuous value creation for holders'
      ],
      status: 'Planned'
    }
  ];

  return (
    <section className="roadmap-section">
      <div className="roadmap-container">
        {/* Header */}
        <div className="roadmap-header">
          <h2 className="roadmap-title"> Our Journey</h2>
          <p className="roadmap-subtitle">
            Transparent, realistic milestones built with our community
          </p>
        </div>

        {/* Timeline */}
        <div className="roadmap-timeline">
          {/* Connecting Line */}
          <div className="timeline-line"></div>

          {/* Phases */}
          <div className="phases-grid">
            {phases.map((phase, index) => (
              <div
                key={phase.id}
                className={`phase-card phase-${phase.status}`}
                style={{ '--phase-index': index }}
              >
                {/* Phase Icon Circle */}
                <div className="phase-icon-wrapper">
                  <div className="phase-icon">{phase.icon}</div>
                  {phase.status === 'active' && <div className="phase-pulse"></div>}
                </div>

                {/* Phase Content */}
                <div className="phase-content">
                  <div className="phase-header">
                    <h3 className="phase-title">{phase.title}</h3>
                    <span className={`phase-badge phase-badge-${phase.status}`}>
                      {phase.status === 'active' && '🟢 Active'}
                      {phase.status === 'upcoming' && '🟡 Coming'}
                      {phase.status === 'future' && '⭕ Future'}
                    </span>
                  </div>

                  <p className="phase-month">{phase.month}</p>

                  {/* Items List */}
                  <ul className="phase-items">
                    {phase.items.map((item, idx) => (
                      <li key={idx} className="phase-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Connector */}
                <div className="phase-connector"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Statement */}
        {/* <div className="trust-box">
          <div className="trust-icon">🔒</div>
          <div className="trust-content">
            <h3>Why We're Transparent</h3>
            <p>
              No hidden roadmap changes. No secret team mints. No overpromising. 
              <strong> We only add to this roadmap what we'll actually deliver.</strong>
            </p>
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default Roadmap;
