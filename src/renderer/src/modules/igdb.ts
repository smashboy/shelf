import igdb from "igdb-api-node";

export const igdbClient = igdb("v1a1ky8kjmvkt9dxpxd3vh6mtm3yop", "5dxjvfthjvjm4f59uvy2bn0ccb9yi8");

export async function searchGames(programs: string[]) {
  // const games: IGDBGameModel[] = [];

  for (const program of programs) {
    try {
      const games = await igdbClient
        .fields(["name", "slug"])
        .limit(25)
        .sort("name")
        .sort("name", "desc")
        .search(program)
        .request("/games");

      console.log(games);
    } catch (error) {
      console.error(error);
      continue;
    }
  }
}
