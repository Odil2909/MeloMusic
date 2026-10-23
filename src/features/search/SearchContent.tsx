import { CatalogState } from "@/components/home/CatalogState";
import { AlbumCard } from "@/components/music/AlbumCard";
import { ArtistCard } from "@/components/music/ArtistCard";
import { SectionHeading } from "@/components/music/SectionHeading";
import { TrackRow } from "@/components/music/TrackRow";
import { Icon } from "@/components/ui/Icon";
import { getSearchData, type SearchPageData } from "./get-search-data";

export async function SearchContent({ query }: { query: string }) {
  const data = await getSearchData(query);
  return <SearchResultsView data={data} />;
}

function SearchResultsView({ data }: { data: SearchPageData }) {
  const results = data.results;

  return (
    <div className="search-page">
      <div className="search-page-heading">
        <span className="section-eyebrow">КАТАЛОГ JAMENDO</span>
        <h1>{data.query ? `Результаты по запросу «${data.query}»` : "Найди свою музыку"}</h1>
        <p>Ищи треки, альбомы и исполнителей в открытом музыкальном каталоге.</p>
      </div>

      <form action="/search" aria-label="Поиск в музыкальном каталоге" className="search-page-form" role="search">
        <label className="search-page-field">
          <Icon className="search-page-icon" name="search" size={19} />
          <input
            aria-label="Название трека, альбома или артиста"
            autoComplete="off"
            defaultValue={data.query}
            maxLength={100}
            name="q"
            placeholder="Название трека, альбома или артиста"
            type="search"
          />
        </label>
        <button className="search-page-button" type="submit">Найти</button>
      </form>

      {!data.query ? (
        <div className="catalog-state search-prompt" role="status">
          <strong>Начни с названия или имени артиста</strong>
          <span>Результаты будут загружены из Jamendo после поиска.</span>
        </div>
      ) : data.error ? (
        <CatalogState error={data.error} emptyMessage="Попробуй другой запрос." />
      ) : !results || (
        results.tracks.length === 0 && results.albums.length === 0 && results.artists.length === 0
      ) ? (
        <CatalogState error={null} emptyMessage={`По запросу «${data.query}» пока ничего не найдено.`} />
      ) : (
        <div className="search-results">
          {results.tracks.length > 0 ? (
            <section aria-labelledby="search-tracks-title" className="content-section">
              <SectionHeading
                aside={`${results.tracks.length} треков`}
                description="Композиции из каталога Jamendo. Воспроизведение в Melo пока недоступно."
                eyebrow="ТРЕКИ"
                id="search-tracks-title"
                title="Треки"
              />
              <div aria-label="Результаты поиска: треки" className="track-list">
                {results.tracks.map((track, index) => <TrackRow index={index} key={track.id} track={track} />)}
              </div>
            </section>
          ) : null}

          {results.albums.length > 0 ? (
            <section aria-labelledby="search-albums-title" className="content-section">
              <SectionHeading
                aside={`${results.albums.length} альбомов`}
                description="Альбомы и релизы, найденные у провайдера."
                eyebrow="АЛЬБОМЫ"
                id="search-albums-title"
                title="Альбомы"
              />
              <div className="album-grid">
                {results.albums.map((album) => <AlbumCard album={album} key={album.id} />)}
              </div>
            </section>
          ) : null}

          {results.artists.length > 0 ? (
            <section aria-labelledby="search-artists-title" className="content-section content-section-last">
              <SectionHeading
                aside={`${results.artists.length} артистов`}
                description="Исполнители из открытого каталога."
                eyebrow="АРТИСТЫ"
                id="search-artists-title"
                title="Артисты"
              />
              <div className="artist-grid">
                {results.artists.map((artist) => <ArtistCard artist={artist} key={artist.id} />)}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
