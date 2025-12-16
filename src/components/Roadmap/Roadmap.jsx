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
        <ul>
         <li> Launch of 12,000 unique NFTs</li> 
         <li> Fully revealed artwork (no fake previews)</li>
         <li> Fair & public mint on Optimism</li>
         <li> Smart contract deployed & verified</li>
         <li> Secure minting with no hidden functions</li>
        </ul>
   


      ],
      status: 'active'
    },
    {
      id: 2,
      title: 'Community First',
      // month: 'Q1 2025',
      icon: '👥',
      items: [
        <ul>
          <li>Exclusive holder Discord roles</li> 
        <li> Weekly community events</li>
        <li> Holder airdrops & rewards</li>
        <li> Rarity tools & floor tracking</li>

        </ul>
      ],
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Expand & Collaborate',
      month: 'Q2 2025',
      icon: '🤝',
      items: [
        '🔲 Cross-project collaborations',
        '🔲 Koneko mini-games beta',
        '🔲 Staking & points system',
        '🔲 Merch & physical items'
      ],
      status: 'upcoming'
    },
    {
      id: 4,
      title: 'Long-term Vision',
      month: 'Q3+ 2025',
      icon: '🌟',
      items: [
        '🔲 Community governance voting',
        '🔲 Interactive NFT features',
        '🔲 IRL meet-ups & events',
        '🔲 Sustained ecosystem growth'
      ],
      status: 'future'
    }
  ];

  return (
    <section className="roadmap-section">
      <div className="roadmap-container">
        {/* Header */}
        <div className="roadmap-header">
          <h2 className="roadmap-title">🗺️ Our Journey</h2>
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
        <div className="trust-box">
          <div className="trust-icon">🔒</div>
          <div className="trust-content">
            <h3>Why We're Transparent</h3>
            <p>
              No hidden roadmap changes. No secret team mints. No overpromising. 
              <strong> We only add to this roadmap what we'll actually deliver.</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
