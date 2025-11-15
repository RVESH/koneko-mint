import React, { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";

import "./ExplorePage.scss";
import FilterSidebar from "../components/FilterSide/FilterSidebar";
import NFTCard from "../components/NFTCard/NFTCard";
import Pagination from "../components/Pagination/Pagination";
import SearchBox from "../../../components/searchBox/SearchBox";
import NFTPopup from "../../../components/NFTPopup/NFTPopup";
import CollectionFilter from "../../../components/CollectionFilter/CollectionFilter";
import { getMintedNFTs } from "../../../utils/storageHelpers";

const IMAGES_PER_PAGE = 18;

const ExplorePage = () => {
  const navigate = useNavigate();

  const [allNfts, setAllNfts] = useState([]);
  const [filteredNfts, setFilteredNfts] = useState([]);
  const [mintedNFTs, setMintedNFTs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSidebar, setShowSidebar] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  // Counts for filters
  const [counts, setCounts] = useState({
    total: 12000,
    available: 0,
    minted: 0
  });

  // Load data on mount
  useEffect(() => {
    fetch("/room/metadata.json")
      .then(res => res.json())
      .then(data => {
        setAllNfts(data);
        setFilteredNfts(data);
        const minted = getMintedNFTs().map(nft => nft.id);
        setMintedNFTs(minted);

        // Calculate counts
        const total = data.length;
        const mintedCount = minted.length;
        setCounts({
          total,
          minted: mintedCount,
          available: total - mintedCount
        });
      });
  }, []);

  // Apply filter & search
  useEffect(() => {
    const mintedIds = mintedNFTs;
    let filtered = allNfts; // Single declaration

    // Apply filter
    if (activeFilter === 'available') {
      filtered = allNfts.filter(nft => !mintedIds.includes(nft.id));
    } else if (activeFilter === 'minted') {
      filtered = allNfts.filter(nft => mintedIds.includes(nft.id));
    }

    // Apply search if query exists
    if (query.trim()) {
      const lower = query.toLowerCase();
      filtered = filtered.filter(n => n.name.toLowerCase().includes(lower));
    }

    setFilteredNfts(filtered);
    setCurrentPage(1);
  }, [activeFilter, allNfts, mintedNFTs, query]);

  const totalPages = Math.ceil(filteredNfts.length / IMAGES_PER_PAGE);
  const start = (currentPage - 1) * IMAGES_PER_PAGE;
  const currentNFTs = filteredNfts.slice(start, start + IMAGES_PER_PAGE);

  const handleSearchChange = val => {
    setQuery(val);
    setSelectedNFT(null);
  };

  const openPopup = id => {
    const nft = allNfts.find(n => n.id === id);
    if (nft) setSelectedNFT(nft);
  };

  const closePopup = () => setSelectedNFT(null);

  return (
    <Fragment>
      <div className="explore-page">
        {showSidebar && (
          <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} />
        )}

        <aside className={`sidebar-panel ${showSidebar ? "open" : ""}`}>
          <button className="close-sidebar" onClick={() => setShowSidebar(false)}>×</button>
          <FilterSidebar />
        </aside>

        <main className="nft-section">
          {/* Filter Tabs */}
          <CollectionFilter
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
          />

          {/* Controls */}
          <div className="controls-row">
            <button className="filter-btn" onClick={() => setShowSidebar(true)}>
              Filters
            </button>
            <SearchBox
              placeholder="Search by name…"
              value={query}
              onChange={handleSearchChange}
            />
          </div>

          {/* Grid */}
          <div className="nft-grid">
            {currentNFTs.length ? (
              currentNFTs.map(nft => (
                <NFTCard key={nft.id} nft={nft} onZoomClick={() => openPopup(nft.id)
                }               onClick={() => navigate(`/RandomMint`)}/>
              ))
            ) : (
              <div className="no-results">
                <div className="no-results-icon">📭</div>
                <h3>No NFTs Found</h3>
                <p>Try a different filter or search.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </main>
      </div>

      {/* Popup */}
      {selectedNFT && (
        <NFTPopup nft={selectedNFT} onClose={closePopup} showFromSearch />
      )}
    </Fragment>
  );
};

export default ExplorePage;
