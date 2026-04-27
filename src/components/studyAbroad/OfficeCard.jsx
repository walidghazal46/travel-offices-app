import styles from "../../styles/studyAbroad.module.css";

export default function OfficeCard({ office, labels, onClick }) {
  const ratingClassName = {
    "ممتاز": styles.ratingExcellent,
    "جيد جداً": styles.ratingGood,
    "جيد": styles.ratingFair,
  }[office.ratingLabel] || styles.ratingFair;

  return (
    <article
      className={styles.card}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <h3 className={styles.cardTitle}>{office.name}</h3>
          {office.isOfficial ? (
            <span className={styles.officialBadge}>{labels.official}</span>
          ) : null}
          {office.verified ? (
            <span className={styles.verifiedBadge}>{labels.verified}</span>
          ) : null}
        </div>

        {office.rating ? (
          <div className={`${styles.ratingBadge} ${ratingClassName}`}>
            <span className={styles.star}>★</span>
            <span>{Number(office.rating).toFixed(1)}</span>
          </div>
        ) : null}
      </div>

      <div className={styles.cardLocation}>
        <span className={styles.govPill}>{office.governorate}</span>
        <span className={styles.areaName}>{office.area}</span>
      </div>

      <p className={styles.address}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {office.address}
      </p>

      {office.countries?.length ? (
        <div className={styles.countriesRow}>
          <span className={styles.countriesLabel}>{labels.countries}</span>
          <div className={styles.countryChips}>
            {office.countries.map((country) => (
              <span key={`${office.id}-${country}`} className={styles.countryChip}>
                {country}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {office.tags?.length ? (
        <div className={styles.tagsRow}>
          {office.tags.map((tag) => (
            <span key={`${office.id}-${tag}`} className={styles.tagChip}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {office.phones?.length ? (
        <div className={styles.phonesHint}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>{office.phones.length} {labels.phoneCount || (office.phones.length === 1 ? "رقم" : "أرقام")}</span>
        </div>
      ) : null}

      <div className={styles.cardActions}>
        <span className={styles.detailsHint}>
          {labels.viewDetails || "اضغط للتفاصيل"}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width:14,height:14,marginInlineStart:4}}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </span>
      </div>
    </article>
  );
}
