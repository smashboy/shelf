import igdb from "igdb-api-node";
import fetch from "node-fetch";
import CacheStore from "../store/CacheStore";
import type {
  GameBaseModel,
  MediaModel,
  GameInfoBaseModel,
  GameInfoCachedModel,
  GameInfoModel,
  GenreModel,
  WebsiteModel,
  GameBaseCachedModel,
} from "src/models/GameModel";

export type SearchGamesProps = Array<{
  cachedGamesSearchSlugs?: string[];
  key: string;
  name: string;
}>;

export default class IGDBClient {
  private readonly client = igdb(
    "v1a1ky8kjmvkt9dxpxd3vh6mtm3yop",
    "wewwkydboi2wjojajzmn84gnsgfo6s"
  );

  private readonly cacheStore: CacheStore;

  constructor(cacheStore: CacheStore) {
    this.cacheStore = cacheStore;
  }

  async getGameInfo(gameSlug: string, gameId: number) {
    try {
      const cachedInfo = await this.cacheStore.load<GameInfoCachedModel>("info", gameSlug);

      if (cachedInfo) {
        const gameInfo: GameInfoModel = {
          totalRating: cachedInfo.data.totalRating,
          totalRatingCount: cachedInfo.data.totalRatingCount,
          storyline: cachedInfo.data.storyline,
          summary: cachedInfo.data.summary,
          releaseDate: cachedInfo.data.releaseDate,
          websites: [],
          genres: [],
          screenshots: [],
          artworks: [],
        };

        // TODO: add game id
        gameInfo.genres = await this.loadGenres(cachedInfo.data.genreIds);
        gameInfo.websites = await this.loadWebsites(cachedInfo.data.websiteIds);
        gameInfo.screenshots = await this.loadSreenshots(cachedInfo.data.screenshotIds);
        gameInfo.artworks = await this.loadArtworks(cachedInfo.data.artworkIds);

        return gameInfo;
      }

      const response = await this.client
        .fields([
          "total_rating",
          "total_rating_count",
          "screenshots",
          "storyline",
          "summary",
          "genres",
          "websites",
          "artworks",
          "first_release_date",
          // TODO
          "keywords",
          "videos",
          "involved_companies",
        ])
        .where(`id = ${gameId}`)
        .request("/games");

      const info = response.data[0] || null;

      if (!info) return null;

      const base: GameInfoBaseModel = {
        totalRating: info.total_rating || 0,
        totalRatingCount: info.total_rating_count || 0,
        summary: info.summary || "",
        storyline: info.storyline || "",
        releaseDate: info.first_release_date,
      };

      const cachedModel: GameInfoCachedModel = {
        ...base,
        genreIds: info.genres || [],
        websiteIds: info.websites || [],
        screenshotIds: info.screenshots || [],
        artworkIds: info.artworks || [],
      };

      const gameInfo: GameInfoModel = {
        ...base,
        websites: [],
        genres: [],
        screenshots: [],
        artworks: [],
      };

      // TODO: add game id
      gameInfo.genres = await this.loadGenres(cachedModel.genreIds);
      gameInfo.websites = await this.loadWebsites(cachedModel.websiteIds);
      gameInfo.screenshots = await this.loadSreenshots(cachedModel.screenshotIds);
      gameInfo.artworks = await this.loadArtworks(cachedModel.artworkIds);

      await this.cacheStore.save("info", gameSlug, cachedModel);

      return gameInfo;
    } catch (error) {
      console.error(error);
      // return null;
    }
  }

  private async loadArtworks(ids: number[]) {
    const artworks: MediaModel[] = [];

    for (const id of ids) {
      try {
        const cachedArtwork = await this.cacheStore.load<MediaModel>("artworks", id.toString());

        if (cachedArtwork) {
          artworks.push({ ...cachedArtwork.data, data: cachedArtwork.media.artwork });
          continue;
        }

        const response = await this.client
          .fields(["checksum", "width", "height", "image_id"])
          .where(`id = ${id}`)
          .request("/artworks");

        const data = response.data[0] || null;

        if (!data) continue;

        // t_thumb_widescreen_large
        // t_original

        const imageResponse = await fetch(
          `https://images.igdb.com/igdb/image/upload/t_original/${data.image_id}.png`
        );

        const buffer = await imageResponse.arrayBuffer();

        const base64 = Buffer.from(buffer).toString("base64");

        const artwork: MediaModel = {
          width: data.width,
          height: data.height,
          hash: data.checksum,
          data: `data:image/png;base64,${base64}`,
        };

        await this.cacheStore.save(
          "artworks",
          id.toString(),
          {
            width: artwork.width,
            height: artwork.height,
            hash: artwork.hash,
          },
          {
            artwork: artwork.data,
          }
        );

        artworks.push(artwork);
      } catch (error) {
        console.error(error);
        continue;
      }
    }

    return artworks;
  }

  private async loadSreenshots(ids: number[]) {
    const screenshots: MediaModel[] = [];

    for (const id of ids) {
      try {
        const cachedScreenshot = await this.cacheStore.load<MediaModel>(
          "screenshots",
          id.toString()
        );

        if (cachedScreenshot) {
          screenshots.push({ ...cachedScreenshot.data, data: cachedScreenshot.media.screenshot });
          continue;
        }

        const response = await this.client
          .fields(["checksum", "width", "height", "image_id"])
          .where(`id = ${id}`)
          .request("/screenshots");

        const data = response.data[0] || null;

        if (!data) continue;

        const imageResponse = await fetch(
          `https://images.igdb.com/igdb/image/upload/t_original/${data.image_id}.png`
        );

        const buffer = await imageResponse.arrayBuffer();

        const base64 = Buffer.from(buffer).toString("base64");

        const screenshot: MediaModel = {
          width: data.width,
          height: data.height,
          hash: data.checksum,
          data: `data:image/png;base64,${base64}`,
        };

        await this.cacheStore.save(
          "screenshots",
          id.toString(),
          {
            width: screenshot.width,
            height: screenshot.height,
            hash: screenshot.hash,
          },
          {
            screenshot: screenshot.data,
          }
        );

        screenshots.push(screenshot);
      } catch (error) {
        console.error(error);
        continue;
      }
    }

    return screenshots;
  }

  private async loadWebsites(ids: number[]) {
    const websites: WebsiteModel[] = [];

    for (const id of ids) {
      try {
        const cachedWebsite = await this.cacheStore.load<WebsiteModel>("websites", id.toString());

        if (cachedWebsite) {
          websites.push(cachedWebsite.data);
          continue;
        }
        const response = await this.client
          .fields(["url", "checksum", "trusted"])
          .where(`id = ${id}`)
          .request("/websites");

        const website = response.data[0] || null;

        if (!website) continue;

        const model: WebsiteModel = {
          trusted: website.trusted,
          url: website.url,
          hash: website.checksum,
        };

        await this.cacheStore.save("websites", id.toString(), model);

        websites.push(model);
      } catch (error) {
        console.error(error);
        continue;
      }
    }

    return websites;
  }

  private async loadGenres(ids: number[]) {
    const genres: GenreModel[] = [];

    for (const id of ids) {
      try {
        const cachedGenre = await this.cacheStore.load<GenreModel>("genres", id.toString());

        if (cachedGenre) {
          genres.push(cachedGenre.data);
          continue;
        }

        const response = await this.client
          .fields(["name", "checksum"])
          .where(`id = ${id}`)
          .request("/genres");

        const genre = response.data[0] || null;

        if (!genre) continue;

        const model: GenreModel = {
          name: genre.name,
          hash: genre.checksum,
        };

        await this.cacheStore.save("genres", id.toString(), model);

        genres.push(model);
      } catch (error) {
        console.error(error);
        continue;
      }
    }

    return genres;
  }

  private async loadCover(gameId: number): Promise<MediaModel | null> {
    try {
      const cachedCover = await this.cacheStore.load<MediaModel>("covers", gameId.toString());

      if (cachedCover) return { ...cachedCover.data, data: cachedCover.media.cover };

      const coverRespose = await this.client
        .fields(["checksum", "width", "height", "image_id"])
        .where(`game = ${gameId}`)
        .request("/covers");

      const coverData = coverRespose.data[0] || null;

      if (!coverData) return null;

      const imageResponse = await fetch(
        `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${coverData.image_id}.png`
      );

      const buffer = await imageResponse.arrayBuffer();

      const base64 = Buffer.from(buffer).toString("base64");

      const cover: MediaModel = {
        width: coverData.width,
        height: coverData.height,
        hash: coverData.checksum,
        data: `data:image/png;base64,${base64}`,
      };

      await this.cacheStore.save(
        "covers",
        gameId.toString(),
        {
          width: cover.width,
          height: cover.height,
          hash: cover.hash,
        },
        {
          cover: cover.data,
        }
      );

      return cover;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async searchGames(programs: SearchGamesProps) {
    const games: Record<string, GameBaseModel[]> = {};
    const cachedGames = await this.cacheStore.loadBucket("base");

    for (const program of programs) {
      try {
        if (
          cachedGames &&
          program.cachedGamesSearchSlugs &&
          program.cachedGamesSearchSlugs.length > 0
        ) {
          const loadedGames: GameBaseModel[] = [];

          for (const slug of program.cachedGamesSearchSlugs) {
            const cachedGame = cachedGames[slug];

            if (cachedGame) {
              const data = cachedGame.data as GameBaseCachedModel;

              const cover = await this.loadCover(data.id);

              loadedGames.push({
                ...data,
                cover,
              });
            }
          }

          games[program.key] = loadedGames;
          continue;
        }

        const gamesResponse = await this.client
          .fields(["name", "cover", "slug", "checksum"])
          .limit(25)
          .search(program.name)
          // .where("status = 0")
          .request("/games");

        const gamesData = gamesResponse.data;

        if (gamesData.length === 0) continue;

        const loadedGames: GameBaseModel[] = [];

        for (const game of gamesData) {
          try {
            const baseModel = {
              id: game.id,
              name: game.name,
              slug: `custom-${game.slug}`,
              hash: game.checksum,
            };

            const cover = await this.loadCover(baseModel.id);

            const loadedModel = { ...baseModel, cover };

            loadedGames.push(loadedModel);

            await this.cacheStore.save("base", baseModel.slug, baseModel);
          } catch (error) {
            // console.error(error);
            continue;
          }
        }

        await this.cacheStore.update("execution-files", program.key, (prevCache) => ({
          ...prevCache,
          cachedGamesSearchSlugs: Array.from(
            new Set([
              ...(prevCache.cachedGamesSearchSlugs || []),
              ...loadedGames.map((game) => game.slug),
            ])
          ),
        }));

        games[program.key] = loadedGames;
      } catch (error) {
        // console.error(error);
        continue;
      }
    }

    return games;
  }
}
