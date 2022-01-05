import crypto from "crypto";
import { ipcMain } from "electron";
import { CacheWithMediaModel } from "src/models/CacheModel";
import type { GameBaseModel, UserGameModel } from "src/models/GameModel";
import CacheStore from "../store/CacheStore";
import IGDBClient from "./IGDBClient";

export type AddGamesProps = Array<{ gameSlug: string; relatedExecution?: string }>;
export type GetGameInfo = { gameSlug: string; gameId: number };

interface GamesManagerProps {
  cacheStore: CacheStore;
  igdb: IGDBClient;
}

export default class GamesManager {
  private readonly cacheStore: CacheStore;

  private readonly igdb: IGDBClient;

  constructor(props: GamesManagerProps) {
    this.cacheStore = props.cacheStore;
    this.igdb = props.igdb;

    this.initListeners();
  }

  private initListeners() {
    ipcMain.handle("games-list", async () => {
      const games = await this.getGamesList();

      return games;
    });

    ipcMain.handle("get-game-info", async (_, props: GetGameInfo) => {
      const info = await this.getGameInfo(props);
      return info;
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

  async getGameInfo(props: GetGameInfo) {
    try {
      const info = await this.igdb.getGameInfo(props.gameSlug, props.gameId);
      return info;
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
