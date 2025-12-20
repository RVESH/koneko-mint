// components/Preloader.jsx
import React from "react";
import "./Preloader.scss";

const Preloader = () => {
  return (
    <div className="preloader">
      <div className="spinner"></div>
      <p>Connecting to blockchain...</p>
    </div>
  );
};

export default Preloader;
