import React from "react";
import PropTypes from "prop-types";
import "./SearchBox.scss";

const SearchBox = ({
  placeholder = "Search...",
  value,
  onChange
}) => {
  return (
    <div className="searchbox">
      <svg className="icon-search" viewBox="0 0 24 24" aria-hidden="true">
        {/* … */}
      </svg>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={placeholder}
      />
      {value && (
        <button
          className="clear-btn"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
};

SearchBox.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default SearchBox;
