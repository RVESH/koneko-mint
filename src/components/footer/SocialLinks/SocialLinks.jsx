import React, { useState } from "react";
import "./SocialLinks.scss";

// Import PNG Icons
import TwitterIcon from "../../../images/social/twitter.png";
import DiscordIcon from "../../../images/social/discord.png";
import TelegramIcon from "../../../images/social/telegram.png";
import InstagramIcon from "../../../images/social/insta.png";


const SocialLinks = () => {
  const [hoveredPlatform, setHoveredPlatform] = useState(null);

  const socialPlatforms = [
    {
      id: "twitter",
      name: "Twitter",
      url: "https://twitter.com/koneko",
      icon: TwitterIcon,
      label: "Follow us on Twitter",
      color: "#1DA1F2"
    },
    {
      id: "discord",
      name: "Discord",
      url: "https://discord.gg/koneko",
      icon: DiscordIcon,
      label: "Join our Discord server",
      color: "#5865F2"
    },
    {
      id: "telegram",
      name: "Telegram",
      url: "https://t.me/koneko",
      icon: TelegramIcon,
      label: "Join our Telegram channel",
      color: "#0088cc"
    },
    {
      id: "instagram",
      name: "Instagram",
      url: "https://instagram.com/koneko",
      icon: InstagramIcon,
      label: "Follow us on Instagram",
      color: "#E1306C"
    }
  ];

  return (
    <div className="social-links-container">
      <div 
        className="social-links" 
        aria-label="Social media links"
        role="navigation"
      >
        {socialPlatforms.map((platform) => (
          <a
            key={platform.id}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={platform.label}
            className={`social-link social-link-${platform.id}`}
            title={platform.name}
            data-platform={platform.id}
            style={{ "--platform-color": platform.color }}
            onMouseEnter={() => setHoveredPlatform(platform.id)}
            onMouseLeave={() => setHoveredPlatform(null)}
          >
            {/* Icon Container */}
            <span className="social-icon-wrapper">
              <img 
                src={platform.icon} 
                alt={platform.name}
                className="social-icon-img"
                loading="lazy"
              />
            </span>

            {/* Tooltip */}
            <span className="social-tooltip">{platform.name}</span>

            {/* Glow Effect */}
            <span className="social-glow"></span>

            {/* Background overlay */}
            <span className="social-bg-overlay"></span>
          </a>
        ))}
      </div>

      {/* Active indicator */}
      {hoveredPlatform && (
        <div className="social-active-indicator">
          <span>{hoveredPlatform.toUpperCase()}</span>
        </div>
      )}
    </div>
  );
};

export default SocialLinks;
