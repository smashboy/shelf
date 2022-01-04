import igdb from "igdb-api-node";
import fetch from "node-fetch";
import CacheStore from "../store/CacheStore";
import { GameBaseModel, GameCoverModel } from "src/models/GameModel";

export type SearchGamesProps = Array<{ cacheKey: string; name: string }>;

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

    for (const program of programs) {
      try {
        const cachedData = await this.cacheStore.load("games-base", program.cacheKey);

        if (cachedData) {
          const loadedGames: GameBaseModel[] = (cachedData.data.games as GameBaseModel[]).map(
            ({ cover, ...otherProps }) => ({
              ...otherProps,
              cover: cover
                ? {
                    ...cover,
                    data: cachedData.media[`cover-${otherProps.slug}`],
                  }
                : null,
            })
          );

          games[program.cacheKey] = loadedGames;
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

        for (const index in gamesData) {
          const game = gamesData[index];
          try {
            const coverRespose = await this.client
              .fields(["checksum", "width", "height", "image_id"])
              .where(`game = ${game.id}`)
              .request("/covers");

            const coverData = coverRespose.data[0] || null;

            if (coverData) {
              try {
                const imageResponse = await fetch(
                  `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${coverData.image_id}.png`
                );

                const buffer = await imageResponse.arrayBuffer();

                const base64 = Buffer.from(buffer).toString("base64");

                const cover: GameCoverModel = {
                  width: coverData.width,
                  height: coverData.height,
                  hash: coverData.checksum,
                  data: base64,
                };

                loadedGames.push({
                  id: game.id,
                  name: game.name,
                  slug: game.slug,
                  hash: game.checksum,
                  cover,
                });
              } catch (error) {
                loadedGames.push({
                  id: game.id,
                  name: game.name,
                  slug: game.slug,
                  hash: game.checksum,
                  cover: null,
                });
                console.error(error);
              }
            }
          } catch (error) {
            console.error(error);
            continue;
          }
        }

        const mediaCache: Record<string, string> = {};

        loadedGames.forEach((game) => {
          if (game.cover) {
            mediaCache[`cover-${game.slug}`] = game.cover.data;
          }
        });

        games[program.cacheKey] = loadedGames;

        await this.cacheStore.save(
          "games-base",
          program.cacheKey,
          {
            games: loadedGames.map(({ cover, ...otherProps }) => ({
              ...otherProps,
              cover: cover ? { width: cover.width, height: cover.height, hash: cover.hash } : null,
            })),
          },
          mediaCache
        );
      } catch (error) {
        // console.error(error);
        continue;
      }
    }

    return games;
  }
}
