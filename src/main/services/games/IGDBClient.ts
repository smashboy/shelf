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
  CompanyModel,
  ThemeModel,
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
          igdbTotalRating: cachedInfo.data.igdbTotalRating,
          igdbTotalRatingCount: cachedInfo.data.igdbTotalRatingCount,
          storyline: cachedInfo.data.storyline,
          summary: cachedInfo.data.summary,
          releaseDate: cachedInfo.data.releaseDate,
          websites: [],
          genres: [],
          screenshots: [],
          artworks: [],
          companies: [],
          themes: [],
        };

        // TODO: add game id
        const [genres, themes, websites, screenshots, artworks, companies] = await Promise.all([
          this.loadGenres(cachedInfo.data.genreIds),
          this.loadThemes(cachedInfo.data.themeIds),
          this.loadWebsites(gameId, cachedInfo.data.websiteIds),
          this.loadSreenshots(gameId, cachedInfo.data.screenshotIds),
          this.loadArtworks(gameId, cachedInfo.data.artworkIds),
          this.loadCompanies(gameId, cachedInfo.data.companyIds),
        ]);

        gameInfo.genres = genres;
        gameInfo.themes = themes;
        gameInfo.websites = websites;
        gameInfo.screenshots = screenshots;
        gameInfo.artworks = artworks;
        gameInfo.companies = companies;

        return gameInfo;
      }

      const response = await this.client
        .fields([
          "total_rating",
          "total_rating_count",
          "rating",
          "rating_count",
          "screenshots",
          "storyline",
          "summary",
          "genres",
          "websites",
          "artworks",
          "first_release_date",
          "involved_companies",
          "themes",
          // TODO
          "videos",
        ])
        .where(`id = ${gameId}`)
        .request("/games");

      const info = response.data[0] || null;

      if (!info) return null;

      const base: GameInfoBaseModel = {
        totalRating: info.total_rating || 0,
        totalRatingCount: info.total_rating_count || 0,
        igdbTotalRating: info.rating || 0,
        igdbTotalRatingCount: info.rating_count || 0,
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
        companyIds: info.involved_companies || [],
        themeIds: info.themes || [],
      };

      const gameInfo: GameInfoModel = {
        ...base,
        websites: [],
        genres: [],
        screenshots: [],
        artworks: [],
        companies: [],
        themes: [],
      };

      // TODO: add game id
      const [genres, themes, websites, screenshots, artworks, companies] = await Promise.all([
        this.loadGenres(cachedModel.genreIds),
        this.loadThemes(cachedModel.themeIds),
        this.loadWebsites(gameId, cachedModel.websiteIds),
        this.loadSreenshots(gameId, cachedModel.screenshotIds),
        this.loadArtworks(gameId, cachedModel.artworkIds),
        this.loadCompanies(gameId, cachedModel.companyIds),
      ]);

      gameInfo.genres = genres;
      gameInfo.themes = themes;
      gameInfo.websites = websites;
      gameInfo.screenshots = screenshots;
      gameInfo.artworks = artworks;
      gameInfo.companies = companies;

      await this.cacheStore.save("info", gameSlug, cachedModel);

      return gameInfo;
    } catch (error) {
      console.error(error);
      // return null;
    }
  }

  private async loadThemes(themesIds: number[]) {
    const themes: GenreModel[] = [];

    for (const id of themesIds) {
      try {
        const cachedTheme = await this.cacheStore.load<GenreModel>("themes", id.toString());

        if (cachedTheme) {
          themes.push(cachedTheme.data);
          continue;
        }

        const response = await this.client
          .fields(["name", "checksum"])
          .where(`id = ${id}`)
          .request("/themes");

        const genre = response.data[0] || null;

        if (!genre) continue;

        const model: ThemeModel = {
          name: genre.name,
          hash: genre.checksum,
        };

        await this.cacheStore.save("themes", id.toString(), model);

        themes.push(model);
      } catch (error) {
        console.error(error);
        continue;
      }
    }

    return themes;
  }

  private async loadArtworks(gameId: number, artworksIds: number[]) {
    const artworks: MediaModel[] = [];

    for (const id of artworksIds) {
      try {
        const cachedArtwork = await this.cacheStore.load<MediaModel>("artworks", id.toString());

        if (cachedArtwork)
          artworks.push({ ...cachedArtwork.data, data: cachedArtwork.media.artwork });
      } catch (error) {
        continue;
      }
    }

    if (artworks.length > 0) return artworks;

    try {
      const response = await this.client
        .fields(["checksum", "width", "height", "image_id"])
        .where(`game = ${gameId}`)
        .request("/artworks");

      const artworksData = ((response.data || null) as Array<any>) || null;

      if (!artworksData || artworksData.length === 0) return artworks;

      for (const data of artworksData) {
        try {
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
            data.id.toString(),
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
          continue;
        }
      }
    } catch (error) {
      console.error(error);
    }

    return artworks;
  }

  private async loadSreenshots(gameId: number, screenshotsIds: number[]) {
    const screenshots: MediaModel[] = [];

    for (const id of screenshotsIds) {
      try {
        const cachedScreenshot = await this.cacheStore.load<MediaModel>(
          "screenshots",
          id.toString()
        );

        if (cachedScreenshot)
          screenshots.push({ ...cachedScreenshot.data, data: cachedScreenshot.media.screenshot });
      } catch (error) {
        continue;
      }
    }

    if (screenshots.length > 0) return screenshots;

    try {
      const response = await this.client
        .fields(["checksum", "width", "height", "image_id"])
        .where(`game = ${gameId}`)
        .request("/screenshots");

      const screenshotsData = ((response.data || null) as Array<any>) || null;

      if (!screenshotsData || screenshotsData.length === 0) return screenshots;

      for (const data of screenshotsData) {
        try {
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
            data.id.toString(),
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
          continue;
        }
      }
    } catch (error) {
      console.error(error);
    }

    return screenshots;
  }

  private async loadWebsites(gameId: number, websitesIds: number[]) {
    const websites: WebsiteModel[] = [];

    for (const id of websitesIds) {
      try {
        const cachedWebsite = await this.cacheStore.load<WebsiteModel>("websites", id.toString());

        if (cachedWebsite) websites.push(cachedWebsite.data);
      } catch (error) {
        continue;
      }
    }

    if (websites.length > 0) return websites;

    try {
      const response = await this.client
        .fields(["url", "checksum", "trusted", "category"])
        .where(`game = ${gameId}`)
        .request("/websites");

      const websitesData = ((response.data || null) as Array<any>) || null;

      if (!websitesData || websitesData.length === 0) return websites;

      for (const data of websitesData) {
        try {
          const model: WebsiteModel = {
            trusted: data.trusted,
            url: data.url,
            hash: data.checksum,
            category: data.category,
          };

          await this.cacheStore.save("websites", data.id.toString(), model);

          websites.push(model);
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      console.error(error);
    }

    return websites;
  }

  private async loadCompanies(gameId: number, companiesIds: number[]) {
    const companies: CompanyModel[] = [];

    for (const id of companiesIds) {
      try {
        const cachedCompany = await this.cacheStore.load<CompanyModel>("companies", id.toString());

        if (cachedCompany) companies.push(cachedCompany.data);
      } catch (error) {
        continue;
      }
    }

    if (companies.length > 0) return companies;

    try {
      const involvedCompaniesResponse = await this.client
        .fields(["company", "developer", "publisher"])
        .where(`game = ${gameId}`)
        .request("/involved_companies");

      const involvedCompaniesData =
        ((involvedCompaniesResponse.data || null) as Array<any>) || null;

      if (!involvedCompaniesData || involvedCompaniesData.length === 0) return companies;

      for (const involvedCompany of involvedCompaniesData) {
        try {
          if (involvedCompany.developer || involvedCompany.publisher) {
            const companiesResponse = await this.client
              .fields(["name", "checksum"])
              .where(`id = ${involvedCompany.company}`)
              .request("/companies");

            const company = companiesResponse.data[0] || null;

            if (!company) continue;

            const model: CompanyModel = {
              name: company.name,
              hash: company.checksum,
              developer: involvedCompany.developer,
              publisher: involvedCompany.publisher,
            };

            await this.cacheStore.save("companies", involvedCompany.id.toString(), model);

            companies.push(model);
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      console.error(error);
    }

    return companies;
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
