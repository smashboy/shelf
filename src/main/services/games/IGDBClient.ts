import igdb from "igdb-api-node";
import fetch from "node-fetch";
import CacheStore from "../store/CacheStore";
import { GameBaseModel, GameCoverModel } from "src/models/GameModel";
import { ScannedModel } from "src/models/ScannedModel";

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

  async getGameInfo(gameId: number) {
    try {
      const response = await this.client
        .fields([
          "total_rating",
          "total_rating_count",
          "screenshots",
          "storyline",
          "summary",
          "videos",
          "websites",
          "genres",
          "artworks",
        ])
        .where(`game = ${gameId}`)
        .request("/games");

      const game = response.data[0] || null;

      console.log(game);
      // return game;
    } catch (error) {
      console.error(error);
      // return null;
    }
  }

  async searchGames(programs: SearchGamesProps) {
    const games: Record<string, GameBaseModel[]> = {};
    const cachedGames = await this.cacheStore.loadBucket("games-base");

    for (const program of programs) {
      console.log(program.key, program.cachedGamesSearchSlugs);
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
              const data = cachedGame.data as GameBaseModel;

              loadedGames.push({
                ...data,
                cover: data.cover ? { ...data.cover, data: cachedGame.media.cover } : null,
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
            const coverRespose = await this.client
              .fields(["checksum", "width", "height", "image_id"])
              .where(`game = ${game.id}`)
              .request("/covers");

            const coverData = coverRespose.data[0] || null;
            let cover: GameCoverModel | null = null;

            if (coverData) {
              try {
                const imageResponse = await fetch(
                  `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${coverData.image_id}.png`
                );

                const buffer = await imageResponse.arrayBuffer();

                const base64 = Buffer.from(buffer).toString("base64");

                cover = {
                  width: coverData.width,
                  height: coverData.height,
                  hash: coverData.checksum,
                  data: `data:image/png;base64,${base64}`,
                };
              } catch (error) {
                // console.error(error);
              }
            }

            const baseModel = {
              id: game.id,
              name: game.name,
              slug: game.slug,
              hash: game.checksum,
            };

            const loadedModel = { ...baseModel, cover };

            loadedGames.push(loadedModel);

            const cacheModel = {
              ...baseModel,
              cover: cover
                ? {
                    hash: cover.hash,
                    width: cover.width,
                    height: cover.height,
                  }
                : null,
            };

            await this.cacheStore.save(
              "games-base",
              game.slug,
              cacheModel,
              cover ? { cover: cover.data } : undefined
            );
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
