import React, { useEffect, useState } from "react";
import "./animatedNFT.scss";

const AnimatedNFT = () => {
  const [nfts, setNfts] = useState([]);

  useEffect(() => {
    fetch("/room/metadata.json")
      .then((res) => res.json())
      .then((data) => {
        // Only 4–5 NFTs show — hero decoration
        setNfts(data.slice(0, 5));
      })
      .catch(console.error);
  }, []);

  return (
    <div className="animated-nft-wrapper">
      {nfts.map((nft, i) => (
        <div className={`nft-card float-${i % 4}`} key={nft.id}>
          <img src={`/room/images/${nft.filename}`} alt={nft.id} />
        </div>
      ))}
    </div>
  );
};

export default AnimatedNFT;
