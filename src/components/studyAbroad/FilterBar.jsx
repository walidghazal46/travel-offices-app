import { useState } from "react";
import styles from "../../styles/studyAbroad.module.css";

function FilterGroup({ label, value, options, onChange, allLabel }) {
  return (
    <div className={styles.filterGroup}>
      <label className={styles.filterLabel}>{label}</label>
      <div className={styles.chipGroup}>
        <button
          type="button"
          className={`${styles.chip} ${!value ? styles.chipActive : ""}`}
          onClick={() => onChange("")}
        >
          {allLabel}
        </button>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`${styles.chip} ${value === option ? styles.chipActive : ""}`}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FilterBar({
  filters,
  onChange,
  governorates,
  countries,
  ratings,
  labels,
}) {
  const [expanded, setExpanded] = useState(false);
  const activeCount =
    (filters.governorate ? 1 : 0) +
    (filters.country ? 1 : 0) +
    (filters.rating ? 1 : 0);

  const updateFilter = (key, value) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className={styles.filterBar}>
      <button
        type="button"
        className={styles.filterToggle}
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        <span>{labels.filters}</span>
        {activeCount > 0 ? <span className={styles.activeCount}>{activeCount}</span> : null}
        <svg
          className={`${styles.chevron} ${expanded ? styles.chevronOpen : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded ? (
        <div className={styles.filterGrid}>
          <FilterGroup
            label={labels.governorate}
            value={filters.governorate}
            options={governorates}
            onChange={(value) => updateFilter("governorate", value)}
            allLabel={labels.all}
          />
          <FilterGroup
            label={labels.country}
            value={filters.country}
            options={countries}
            onChange={(value) => updateFilter("country", value)}
            allLabel={labels.all}
          />
          <FilterGroup
            label={labels.rating}
            value={filters.rating}
            options={ratings}
            onChange={(value) => updateFilter("rating", value)}
            allLabel={labels.all}
          />

          <div className={styles.filterActions}>
            <button
              type="button"
              className={styles.applyFilterBtn}
              onClick={() => setExpanded(false)}
            >
              {labels.applyFilters || "تطبيق الفلتر"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

