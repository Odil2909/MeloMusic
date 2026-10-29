-- CreateEnum
CREATE TYPE "TrackReactionType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "tracks" (
    "id" UUID NOT NULL,
    "provider" VARCHAR(32) NOT NULL DEFAULT 'jamendo',
    "provider_track_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist_name" TEXT NOT NULL,
    "album_title" TEXT,
    "cover_url" TEXT,
    "provider_url" TEXT,
    "license_url" TEXT,
    "duration_seconds" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist_tracks" (
    "playlist_id" UUID NOT NULL,
    "track_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "added_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlist_tracks_pkey" PRIMARY KEY ("playlist_id","track_id")
);

-- CreateTable
CREATE TABLE "user_track_reactions" (
    "user_id" UUID NOT NULL,
    "track_id" UUID NOT NULL,
    "type" "TrackReactionType" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_track_reactions_pkey" PRIMARY KEY ("user_id","track_id")
);

-- CreateTable
CREATE TABLE "listening_history" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "track_id" UUID NOT NULL,
    "listened_seconds" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "played_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listening_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tracks_title_idx" ON "tracks"("title");

-- CreateIndex
CREATE INDEX "tracks_artist_name_idx" ON "tracks"("artist_name");

-- CreateIndex
CREATE UNIQUE INDEX "tracks_provider_provider_track_id_key" ON "tracks"("provider", "provider_track_id");

-- CreateIndex
CREATE INDEX "playlists_user_id_updated_at_idx" ON "playlists"("user_id", "updated_at");

-- CreateIndex
CREATE UNIQUE INDEX "playlists_user_id_name_key" ON "playlists"("user_id", "name");

-- CreateIndex
CREATE INDEX "playlist_tracks_position_idx" ON "playlist_tracks"("playlist_id", "position");

-- CreateIndex
CREATE INDEX "playlist_tracks_track_id_idx" ON "playlist_tracks"("track_id");

-- CreateIndex
CREATE INDEX "user_track_reactions_track_type_idx" ON "user_track_reactions"("track_id", "type");

-- CreateIndex
CREATE INDEX "listening_history_user_played_at_idx" ON "listening_history"("user_id", "played_at");

-- CreateIndex
CREATE INDEX "listening_history_track_played_at_idx" ON "listening_history"("track_id", "played_at");

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_track_reactions" ADD CONSTRAINT "user_track_reactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_track_reactions" ADD CONSTRAINT "user_track_reactions_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listening_history" ADD CONSTRAINT "listening_history_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
