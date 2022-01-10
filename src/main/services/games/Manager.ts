import crypto from "crypto";
import path from "path";
import fs from "fs";
// import psNode from "ps-node";
import child_process from "child_process";
import { BrowserWindow, ipcMain } from "electron";
import type {
  GameBaseCachedModel,
  MediaModel,
  UserGameModel,
  UserGameModelFull,
} from "src/models/GameModel";
import CacheStore from "../store/CacheStore";
import IGDBClient from "./IGDBClient";

export type AddGamesProps = Array<{ gameSlug: string; relatedExecution?: string }>;
export type GetGameInfo = { gameSlug: string; gameId: number };

interface GamesManagerProps {
  cacheStore: CacheStore;
  igdb: IGDBClient;
  appWindow: BrowserWindow;
}

export default class GamesManager {
  private readonly cacheStore: CacheStore;
  private readonly igdb: IGDBClient;
  private readonly appWindow: BrowserWindow;

  constructor(props: GamesManagerProps) {
    this.cacheStore = props.cacheStore;
    this.igdb = props.igdb;
    this.appWindow = props.appWindow;

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

    ipcMain.handle("launch-game", async (_, gamePath: string) => {
      await this.launchGame(gamePath);
    });
  }

  async launchGame(gamePath: string) {
    return new Promise((resolve, reject) => {
      const pathExists = fs.existsSync(gamePath);

      if (!pathExists) reject(new Error("Game not found."));

      const execFile = path.basename(gamePath);
      const directory = path.dirname(gamePath);

      let gameExit = false;

      const onGameExit = () => {
        if (gameExit) return;

        gameExit = true;
        this.appWindow.webContents.send("game-exit", gamePath);
        gameProcess.removeListener("disconnect", onGameExit);
        gameProcess.removeListener("close", onGameExit);
        gameProcess.removeListener("exit", onGameExit);
      };

      const gameProcess = child_process.exec(
        execFile,
        {
          cwd: directory,
        },
        (error) => {
          if (error) {
            onGameExit();
            return reject(error);
          }

          onGameExit();
        }
      );

      gameProcess.once("disconnect", onGameExit);
      gameProcess.once("close", onGameExit);
      gameProcess.once("exit", onGameExit);

      // if (gameProcess.pid) {
      //   psNode.lookup({ pid: gameProcess.pid }, (error, result) => {
      //     const p = result[0];

      //     console.log("PACKAGE TEST", p);
      //   });
      // }

      resolve({});
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

      const games: UserGameModelFull[] = [];

      for (const userGame of Object.values(userGames)) {
        const gameModel = await this.cacheStore.load<GameBaseCachedModel>(
          "base",
          userGame.data.gameSlug
        );

        if (gameModel) {
          const coverModel = await this.cacheStore.load<MediaModel>(
            "covers",
            gameModel.data.id.toString()
          );

          games.push({
            ...userGame.data,
            ...gameModel.data,
            cover: coverModel
              ? {
                  ...coverModel.data,
                  data: coverModel.media.cover,
                }
              : null,
          });
        }
      }

      return games;
    } catch (error) {
      console.error(error);
    }
  }
}
