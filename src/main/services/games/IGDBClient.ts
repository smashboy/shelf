import igdb from "igdb-api-node";
import { ipcMain } from "electron";
import CacheStore from "../store/CacheStore";

export default class IGDBClient {
  private readonly client = igdb(
    "v1a1ky8kjmvkt9dxpxd3vh6mtm3yop",
    "wewwkydboi2wjojajzmn84gnsgfo6s"
  );

  private readonly cacheStore: CacheStore;

  constructor(cacheStore: CacheStore) {
    this.cacheStore = cacheStore;

    this.initListeners();
  }

  private initListeners() {
    ipcMain.handle("search-games", async (_, programs: string[]) => {
      await this.searchGames(programs);
    });
  }

  async searchGames(programs: string[]) {
    // const games: IGDBGameModel[] = [];

    for (const program of programs) {
      try {
        const games = await this.client
          .fields(["name"])
          .limit(25)
          .search(program)
          .request("/games");

        console.log(games.data);
      } catch (error) {
        // console.error(error);
        continue;
      }
    }
  }
}
