import styles from "../../styles/studyAbroad.module.css";

export default function SearchBar({ value, onChange, placeholder, clearLabel }) {
  return (
    <div className={styles.searchBar}>
      <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        className={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button
          type="button"
          className={styles.clearSearchBtn}
          onClick={() => onChange("")}
          aria-label={clearLabel}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}

