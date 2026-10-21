function TrackSkeleton() {
  return (
    <div aria-hidden="true" className="track-skeleton">
      <span className="skeleton-block skeleton-index" />
      <span className="skeleton-block skeleton-track-cover" />
      <span className="skeleton-track-copy">
        <span className="skeleton-block skeleton-track-title" />
        <span className="skeleton-block skeleton-track-artist" />
      </span>
      <span className="skeleton-block skeleton-duration" />
    </div>
  );
}

function CardSkeleton({ round = false }: { round?: boolean }) {
  return (
    <div aria-hidden="true" className="card-skeleton">
      <span className={`skeleton-block skeleton-card-cover${round ? " skeleton-artist-cover" : ""}`} />
      <span className="skeleton-block skeleton-card-title" />
      <span className="skeleton-block skeleton-card-subtitle" />
    </div>
  );
}

function GenreSkeleton() {
  return (
    <div aria-hidden="true" className="genre-card">
      <span className="skeleton-block skeleton-genre-heading" />
      {[0, 1, 2].map((index) => (
        <div className="genre-track-skeleton" key={index}>
          <span className="skeleton-block skeleton-genre-cover" />
          <span className="skeleton-track-copy">
            <span className="skeleton-block skeleton-track-title" />
            <span className="skeleton-block skeleton-track-artist" />
          </span>
        </div>
      ))}
    </div>
  );
}

export function HomeLoading() {
  return (
    <>
      <section aria-label="Загрузка каталога" className="content-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">КАТАЛОГ</span>
            <span aria-hidden="true" className="skeleton-block skeleton-heading" />
            <span aria-hidden="true" className="skeleton-block skeleton-description" />
          </div>
        </div>
        <div className="track-list">
          {Array.from({ length: 5 }, (_, index) => <TrackSkeleton key={index} />)}
        </div>
      </section>
      <section aria-label="Загрузка альбомов" className="content-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">АЛЬБОМЫ</span>
            <span aria-hidden="true" className="skeleton-block skeleton-heading" />
          </div>
        </div>
        <div className="album-grid">
          {Array.from({ length: 4 }, (_, index) => <CardSkeleton key={index} />)}
        </div>
      </section>
      <section aria-label="Загрузка жанров" className="content-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">ЖАНРЫ</span>
            <span aria-hidden="true" className="skeleton-block skeleton-heading" />
          </div>
        </div>
        <div className="genre-grid">
          <GenreSkeleton />
          <GenreSkeleton />
        </div>
      </section>
      <section aria-label="Загрузка исполнителей" className="content-section">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">ИСПОЛНИТЕЛИ</span>
            <span aria-hidden="true" className="skeleton-block skeleton-heading" />
          </div>
        </div>
        <div className="artist-grid">
          {Array.from({ length: 4 }, (_, index) => <CardSkeleton key={index} round />)}
        </div>
      </section>
    </>
  );
}
