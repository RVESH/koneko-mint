import React from "react";

const Features = () => {
  const features = [
    {
      icon: "🎨",
      title: "Premium Art",
      description: "Curated collection of high-quality digital artwork"
    },
    {
      icon: "⚡",
      title: "Instant Minting",
      description: "Fast and secure blockchain transactions"
    },
    {
      icon: "🏆",
      title: "Community Rewards",
      description: "Earn rewards and exclusive benefits"
    },
    {
      icon: "🔒",
      title: "Secure Trading",
      description: "Safe and transparent marketplace"
    }
  ];

  return (
    <section className="features">
      <div className="container">
        <div className="section-header">
          <h2>Why Choose Koneko?</h2>
          <p>Everything you need to succeed in the NFT space</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
