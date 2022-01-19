import igdb from "igdb-api-node";
import electronLog from "electron-log";
import { ipcMain } from "electron";
import fetch from "node-fetch";
import CacheStore from "../store/CacheStore";
import type {
  GameBaseModel,
  GameInfoBaseModel,
  GameInfoCachedModel,
  GameInfoModel,
  GenreModel,
  WebsiteModel,
  CompanyModel,
  ThemeModel,
  GameModeModel,
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

  private readonly log = electronLog.create("igdb-client");

  private readonly cacheStore: CacheStore;

  constructor(cacheStore: CacheStore) {
    this.cacheStore = cacheStore;

    this.log.transports.console.level = "error";
    this.log.transports.file.fileName = "igdb-client";

    this.initListeners();
  }

  private initListeners() {
    ipcMain.handle("fetch-igdb-image", async (_, endpoint: string, referenceId: number) => {
      const image = await this.loadImage(endpoint, referenceId);
      return image;
    });
  }

  private async loadImage(endpoint: string, referenceId: number) {
    try {
      this.log.log(`Loading image: ${endpoint} | ${referenceId}`);

      const response = await this.client
        .fields(["image_id"])
        .where(`id = ${referenceId}`)
        .request(`/${endpoint}`);

      const imageData = response.data[0] || null;

      if (!imageData) return null;

      const fetchResponse = await fetch(
        `https://images.igdb.com/igdb/image/upload/t_original/${imageData.image_id}.png`
      );

      const buffer = await fetchResponse.arrayBuffer();

      const base64 = Buffer.from(buffer).toString("base64");

      return `data:image/png;base64,${base64}`;
    } catch (error) {
      // @ts-ignore
      this.log.error(`Get image error ${error?.message}`);
      return null;
    }
  }

  async getGameInfo(gameSlug: string, gameId: number) {
    try {
      this.log.log(`Get game info: ${gameSlug} | ${gameId}`);

      const cachedInfo = await this.cacheStore.load<GameInfoCachedModel>("info", gameSlug);

      if (cachedInfo) {
        this.log.log("Game info cache found");

        const gameInfo: GameInfoModel = {
          totalRating: cachedInfo.data.totalRating,
          totalRatingCount: cachedInfo.data.totalRatingCount,
          igdbTotalRating: cachedInfo.data.igdbTotalRating,
          igdbTotalRatingCount: cachedInfo.data.igdbTotalRatingCount,
          storyline: cachedInfo.data.storyline,
          summary: cachedInfo.data.summary,
          releaseDate: cachedInfo.data.releaseDate,
          screenshots: cachedInfo.data.screenshots || [],
          artworks: cachedInfo.data.artworks || [],
          websites: [],
          genres: [],
          companies: [],
          themes: [],
          modes: [],
        };

        // TODO: add game id
        const [genres, themes, websites, companies, modes] = await Promise.all([
          this.loadGenres(cachedInfo.data.genreIds),
          this.loadThemes(cachedInfo.data.themeIds),
          this.loadWebsites(gameId, cachedInfo.data.websiteIds),
          this.loadCompanies(gameId, cachedInfo.data.companyIds),
          this.loadGameModes(cachedInfo.data.modeIds),
        ]);

        gameInfo.genres = genres;
        gameInfo.themes = themes;
        gameInfo.websites = websites;
        gameInfo.companies = companies;
        gameInfo.modes = modes;

        return gameInfo;
      }

      this.log.log("Fetching new game info");

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
          "game_modes",
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
        screenshots: info.screenshots || [],
        artworks: info.artworks || [],
      };

      const cachedModel: GameInfoCachedModel = {
        ...base,
        genreIds: info.genres || [],
        websiteIds: info.websites || [],
        companyIds: info.involved_companies || [],
        themeIds: info.themes || [],
        modeIds: info.game_modes || [],
      };

      const gameInfo: GameInfoModel = {
        ...base,
        websites: [],
        genres: [],
        companies: [],
        themes: [],
        modes: [],
      };

      // TODO: add game id
      const [genres, themes, websites, companies, modes] = await Promise.all([
        this.loadGenres(cachedModel.genreIds),
        this.loadThemes(cachedModel.themeIds),
        this.loadWebsites(gameId, cachedModel.websiteIds),

        this.loadCompanies(gameId, cachedModel.companyIds),
        this.loadGameModes(cachedModel.modeIds),
      ]);

      gameInfo.genres = genres;
      gameInfo.themes = themes;
      gameInfo.websites = websites;
      gameInfo.companies = companies;
      gameInfo.modes = modes;

      await this.cacheStore.save("info", gameSlug, cachedModel);

      return gameInfo;
    } catch (error) {
      // @ts-ignore
      this.log.error(`Get game info error ${error?.message}`);
      // TODO: maybe error throw
      return null;
    }
  }

  private async loadThemes(themesIds: number[]) {
    this.log.log(`Loading themes ${themesIds.join(", ")}`);

    const themes: GenreModel[] = [];

    for (const id of themesIds) {
      try {
        const cachedTheme = await this.cacheStore.load<GenreModel>("themes", id);

        if (cachedTheme) {
          this.log.log(`Theme cache found ${id}`);

          themes.push(cachedTheme.data);
          continue;
        }

        this.log.log(`Fetching new theme ${id}`);

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

        await this.cacheStore.save("themes", id, model);

        themes.push(model);
      } catch (error) {
        // @ts-ignore
        this.log.error(`Load theme error ${id} ${error?.message}`);
        continue;
      }
    }

    return themes;
  }

  private async loadGameModes(modesIds: number[]) {
    this.log.log(`Loading game modes ${modesIds.join(", ")}`);

    const modes: GameModeModel[] = [];

    for (const id of modesIds) {
      try {
        const cachedMode = await this.cacheStore.load<GameModeModel>("game-modes", id);

        if (cachedMode) {
          this.log.log(`Game mode cache found ${id}`);
          modes.push(cachedMode.data);
          continue;
        }

        this.log.log(`Fetching new game mode ${id}`);

        const response = await this.client
          .fields(["checksum", "name"])
          .where(`id = ${id}`)
          .request("/game_modes");

        const data = response.data[0] || null;

        if (!data) continue;

        const model: GameModeModel = {
          hash: data.checksum,
          name: data.name,
        };

        await this.cacheStore.save("game-modes", id, model);

        modes.push(model);
      } catch (error) {
        // @ts-ignore
        this.log.error(`Load game mode error ${id} ${error?.message}`);
        continue;
      }
    }

    return modes;
  }

  private async loadWebsites(gameId: number, websitesIds: number[]) {
    this.log.log(`Loading websites ${gameId} ${websitesIds.join(", ")}`);

    const websites: WebsiteModel[] = [];

    for (const id of websitesIds) {
      try {
        const cachedWebsite = await this.cacheStore.load<WebsiteModel>("websites", id);

        if (cachedWebsite) {
          this.log.log(`Website cache found ${gameId} ${id}`);
          websites.push(cachedWebsite.data);
        }
      } catch (error) {
        // @ts-ignore
        this.log.error(`Load website cache error ${gameId} ${id} ${error?.message}`);
        continue;
      }
    }

    if (websites.length > 0) return websites;

    try {
      this.log.log(`Fetching new websites data ${gameId}`);

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

          await this.cacheStore.save("websites", data.id, model);

          websites.push(model);
        } catch (error) {
          // @ts-ignore
          this.log.error(`Load website error ${gameId} ${error?.message}`);
          continue;
        }
      }
    } catch (error) {
      // @ts-ignore
      this.log.error(`Fetch websites error ${gameId} ${error?.message}`);
    }

    return websites;
  }

  private async loadCompanies(gameId: number, companiesIds: number[]) {
    this.log.log(`Loading companies ${gameId} ${companiesIds.join(", ")}`);

    const companies: CompanyModel[] = [];

    for (const id of companiesIds) {
      try {
        const cachedCompany = await this.cacheStore.load<CompanyModel>("companies", id);

        if (cachedCompany) {
          companies.push(cachedCompany.data);
          this.log.log(`Company cache found ${gameId} ${id}`);
        }
      } catch (error) {
        // @ts-ignore
        this.log.error(`Load company cache error ${gameId} ${id} ${error?.message}`);
        continue;
      }
    }

    if (companies.length > 0) return companies;

    try {
      this.log.log(`Fetching new companies data ${gameId}`);

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

            await this.cacheStore.save("companies", involvedCompany.id, model);

            companies.push(model);
          }
        } catch (error) {
          // @ts-ignore
          this.log.error(`Load company error ${gameId} ${error?.message}`);
          continue;
        }
      }
    } catch (error) {
      // @ts-ignore
      this.log.error(`Fetch companies error ${gameId} ${error?.message}`);
    }

    return companies;
  }

  private async loadGenres(ids: number[]) {
    this.log.log(`Loading genres ${ids.join(", ")}`);

    const genres: GenreModel[] = [];

    for (const id of ids) {
      try {
        const cachedGenre = await this.cacheStore.load<GenreModel>("genres", id);

        if (cachedGenre) {
          this.log.log(`Genre cache found ${id}`);
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

        await this.cacheStore.save("genres", id, model);

        genres.push(model);
      } catch (error) {
        // @ts-ignore
        this.log.error(`Load genre error ${id} ${error?.message}`);
        continue;
      }
    }

    return genres;
  }

  async textSearchGames(query: string) {
    this.log.log(`Searching games ${query}`);

    const games: GameBaseModel[] = [];

    try {
      const gamesResponse = await this.client
        .fields(["name", "cover", "slug", "checksum"])
        .limit(25)
        .search(query.toLowerCase())
        // .where("status = 0")
        .request("/games");

      const gamesData = gamesResponse.data || [];

      if (gamesData.length === 0) return games;

      for (const game of gamesData) {
        try {
          const baseModel = {
            id: game.id,
            name: game.name,
            slug: `custom-${game.slug}`,
            hash: game.checksum,
            cover: game.cover ?? null,
          };

          games.push(baseModel);

          await this.cacheStore.save("base", baseModel.slug, baseModel);
        } catch (error) {
          // @ts-ignore
          this.log.error(`Load game data error ${error?.message}`);
          continue;
        }
      }

      return games;
    } catch (error) {
      // @ts-ignore
      this.log.error(`Fetch games data error ${error?.message}`);
      return games;
    }
  }

  async searchGames(programs: SearchGamesProps) {
    this.log.log(`Searching games ${programs.map((program) => program.name).join(", ")}`);

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
              this.log.info(`Cached game found ${slug}`);

              const data = cachedGame.data as GameBaseModel;

              loadedGames.push(data);
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

        const gamesData = gamesResponse.data || [];

        if (gamesData.length === 0) continue;

        const loadedGames: GameBaseModel[] = [];

        for (const game of gamesData) {
          try {
            const baseModel = {
              id: game.id,
              name: game.name,
              slug: `custom-${game.slug}`,
              hash: game.checksum,
              cover: game.cover ?? null,
            };

            loadedGames.push(baseModel);

            await this.cacheStore.save("base", baseModel.slug, baseModel);
          } catch (error) {
            // @ts-ignore
            this.log.error(`Load game data error ${error?.message}`);
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
        // @ts-ignore
        this.log.error(`Fetch games data error ${error?.message}`);
        continue;
      }
    }

    return games;
  }
}
