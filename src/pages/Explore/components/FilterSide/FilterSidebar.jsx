import React from "react";
import "./FilterSidebar.scss";

const categories = [
  {
    name: "background",
    options: ["All Items", "red", "soft", "sunny", "winter"],
  },
  {
    name: "hats",
    options: ["red", "yellow", "mix-color", "gredient"],
  },
  {
    name: "eye",
    options: ["Rare", "Epic", "Common", "Legendary", "Mythic"],
  },
];

const FilterSidebar = () => {
  return (
    <aside className="filter-sidebar">
      <h3>Filters</h3>
      {categories.map((cat, idx) => (
        <div key={idx} className="filter-category">
          <details>
            <summary>{cat.name}</summary>
            <div className="filter-options">
              {cat.options.map((opt, i) => (
                <label key={i} className="filter-option">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  {opt}
                </label>
              ))}
            </div>
          </details>
        </div>
      ))}
    </aside>
  );
};

export default FilterSidebar;
