import crypto from "crypto";
import { ipcMain } from "electron";
import { CacheWithMediaModel } from "src/models/CacheModel";
import type { GameBaseModel, UserGameModel } from "src/models/GameModel";
import CacheStore from "../store/CacheStore";

export type AddGamesProps = Array<{ gameSlug: string; relatedExecution?: string }>;

interface GamesManagerProps {
  cacheStore: CacheStore;
}

export default class GamesManager {
  private readonly cacheStore: CacheStore;

  constructor(props: GamesManagerProps) {
    this.cacheStore = props.cacheStore;

    this.initListeners();
  }

  private initListeners() {
    ipcMain.handle("games-list", async () => {
      const games = await this.getGamesList();

      return games;
    });

    ipcMain.handle("add-games", async (_, games: AddGamesProps) => {
      await this.addGames(games);
    });
  }

  async addGames(games: AddGamesProps) {
    try {
      const promises = games.map((game) =>
        this.cacheStore.save("user-games", crypto.randomUUID(), game)
      );

      await Promise.all(promises);
    } catch (error) {
      console.error(error);
    }
  }

  async getGamesList() {
    try {
      const userGames = await this.cacheStore.loadBucket<UserGameModel>("user-games");

      if (!userGames) return [];

      const gamePromises: Array<Promise<CacheWithMediaModel<GameBaseModel> | null>> = [];

      for (const userGame of Object.values(userGames)) {
        gamePromises.push(
          this.cacheStore.load<GameBaseModel>("games-base", userGame.data.gameSlug)
        );
      }

      const games = (await Promise.all(gamePromises))
        .filter((game) => game)
        .map((game) => ({
          ...game!.data,
          cover: game!.data.cover
            ? {
                ...game!.data.cover,
                data: game!.media.cover,
              }
            : null,
        }));

      return games;
    } catch (error) {
      console.error(error);
    }
  }
}
