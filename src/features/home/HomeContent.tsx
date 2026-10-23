import { ArtistCard } from "@/components/music/ArtistCard";
import { AlbumCard } from "@/components/music/AlbumCard";
import { SectionHeading } from "@/components/music/SectionHeading";
import { TrackRow } from "@/components/music/TrackRow";
import { CatalogState } from "@/components/home/CatalogState";
import { RetryCatalogButton } from "@/components/home/RetryCatalogButton";
import { getHomeData } from "./get-home-data";
import { GenreCard } from "@/components/music/GenreCard";

export async function HomeContent() {
  const data = await getHomeData();

  return (
    <>
      <section aria-labelledby="home-tracks-title" className="content-section" id="home-tracks">
        <SectionHeading
          aside="Jamendo"
          description="Открытые композиции каталога. Воспроизведение в Melo пока недоступно."
          eyebrow="ОТКРЫВАЙ"
          id="home-tracks-title"
          title="Музыка в каталоге"
        />
        {data.tracks.items.length === 0 ? (
          <CatalogState
            emptyMessage="Провайдер пока не вернул композиции."
            error={data.tracks.error}
          />
        ) : (
          <div aria-label="Треки каталога Jamendo" className="track-list">
            {data.tracks.items.map((track, index) => (
              <TrackRow index={index} key={track.id} track={track} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="new-releases-title" className="content-section" id="new-releases">
        <SectionHeading
          aside="Даты провайдера"
          description="Альбомы отсортированы по дате релиза, указанной провайдером."
          eyebrow="РЕЛИЗЫ"
          id="new-releases-title"
          title="Недавние релизы"
        />
        {data.albums.items.length === 0 ? (
          <CatalogState
            emptyMessage="Альбомы с подтверждённой датой релиза пока не найдены."
            error={data.albums.error}
          />
        ) : (
          <div className="album-grid">
            {data.albums.items.map((album) => (
              <AlbumCard album={album} key={album.id} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="genres-title" className="content-section">
        <SectionHeading
          aside="Теги Jamendo"
          description="Жанровые категории каталога с доступными композициями, не персональные подборки."
          eyebrow="ЖАНРЫ"
          id="genres-title"
          title="Музыка по жанрам"
        />
        {data.genres.items.length === 0 ? (
          <CatalogState
            emptyMessage="В доступном каталоге пока нет треков для этих жанров."
            error={data.genres.error}
          />
        ) : (
          <div className="genre-grid">
            {data.genres.items.map((genre) => <GenreCard genre={genre} key={genre.id} />)}
          </div>
        )}
        {data.genres.error && data.genres.items.length > 0 ? (
          <div className="catalog-inline-notice" role="status">
            <span>Некоторые жанровые категории сейчас недоступны.</span>
            <RetryCatalogButton />
          </div>
        ) : null}
      </section>

      <section aria-labelledby="artists-title" className="content-section content-section-last">
        <SectionHeading
          aside="Профили Jamendo"
          description="Исполнители, опубликованные в музыкальном каталоге."
          eyebrow="ОТКРЫВАЙ НОВЫХ"
          id="artists-title"
          title="Артисты каталога"
        />
        {data.artists.items.length === 0 ? (
          <CatalogState
            emptyMessage="Провайдер пока не вернул профили исполнителей."
            error={data.artists.error}
          />
        ) : (
          <div className="artist-grid">
            {data.artists.items.map((artist) => (
              <ArtistCard artist={artist} key={artist.id} />
            ))}
          </div>
        )}
      </section>

      <footer className="page-footer">
        <span>Melo · некоммерческий технический прототип</span>
        <span>
          Музыка и авторы: <a href="https://www.jamendo.com" rel="noreferrer" target="_blank">Jamendo</a>
        </span>
      </footer>
    </>
  );
}
