export function SearchLoading() {
  return (
    <div aria-label="Загрузка поиска" className="search-page" role="status">
      <div className="search-page-heading">
        <span className="section-eyebrow">КАТАЛОГ JAMENDO</span>
        <span aria-hidden="true" className="skeleton-block skeleton-search-heading" />
        <span aria-hidden="true" className="skeleton-block skeleton-description" />
      </div>
      <span aria-hidden="true" className="skeleton-block skeleton-search-field" />
      <div className="track-list">
        {Array.from({ length: 5 }, (_, index) => (
          <div aria-hidden="true" className="track-skeleton" key={index}>
            <span className="skeleton-block skeleton-index" />
            <span className="skeleton-block skeleton-track-cover" />
            <span className="skeleton-track-copy">
              <span className="skeleton-block skeleton-track-title" />
              <span className="skeleton-block skeleton-track-artist" />
            </span>
            <span className="skeleton-block skeleton-duration" />
          </div>
        ))}
      </div>
    </div>
  );
}
