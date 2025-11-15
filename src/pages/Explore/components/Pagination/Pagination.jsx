import React, { useState } from "react";
import "./Pagination.scss";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const [inputValue, setInputValue] = useState("");

  // Generate page buttons centered on currentPage
  const getPageNumbers = () => {
    const pages = [];

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    // Adjust if near start or end
    if (currentPage <= 3) {
      start = 1;
      end = Math.min(5, totalPages);
    } else if (currentPage >= totalPages - 2) {
      end = totalPages;
      start = Math.max(1, totalPages - 4);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setInputValue("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleInputChange = (e) => {
    // Allow only numbers between 1 and totalPages
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInputValue(val);
    }
  };

  const handleGoClick = () => {
    const val = Number(inputValue);
    if (val >= 1 && val <= totalPages) {
      onPageChange(val);
      setInputValue("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="pagination">
      <button onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1}>←</button>

      {pages[0] > 1 && (
        <>
          <button onClick={() => handlePageClick(1)}>1</button>
          {pages[0] > 2 && <span className="ellipsis">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={p === currentPage ? "active" : ""}
          onClick={() => handlePageClick(p)}
          aria-current={p === currentPage ? "page" : undefined}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="ellipsis">…</span>}
          <button onClick={() => handlePageClick(totalPages)}>{totalPages}</button>
        </>
      )}

      <button onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages}>→</button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Page"
        value={inputValue}
        onChange={handleInputChange}
        className="goto-input"
      />
      <button onClick={handleGoClick} className="goto-btn" disabled={inputValue === ""}>
        Go
      </button>
    </div>
  );
};

export default Pagination;
