import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDebounce } from "use-debounce";
import type { UserGameModelFull } from "src/models/GameModel";
import { useView, View } from "./ViewStore";

interface GamesListStore {
  games: UserGameModelFull[];
  loading: boolean;
  launchedGames: string[];
  query: string;
  setQuery: (event: React.ChangeEvent<HTMLInputElement>) => void;
  addLaunchedGame: (gamePath: string) => void;
}

const GamesListStoreContext = createContext<GamesListStore | null>(null);

export const GamesListStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const { view } = useView();

  const [games, setGames] = useState<UserGameModelFull[]>([]);
  const [launchedGames, setLaunchedGames] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);
  const [loading, setLoading] = useState(false);

  const filteredGames = useMemo(
    () =>
      debouncedQuery
        ? games.filter((game) => game.name.toLowerCase().indexOf(debouncedQuery.toLowerCase()) > -1)
        : games,
    [debouncedQuery, games]
  );

  useEffect(() => {
    if (view === View.MAIN) handleLoadGames();
  }, [view]);

  useEffect(() => {
    function handleRemoveLaunchedGame(_: any, gamePath: string) {
      setLaunchedGames((prevState) => prevState.filter((path) => path !== gamePath));
    }

    const ipcRenderer = window.bridge.ipcRenderer;

    ipcRenderer.on("game-exit", handleRemoveLaunchedGame);

    return () => {
      ipcRenderer.removeListener("game-exit", handleRemoveLaunchedGame);
    };
  }, []);

  const handleLoadGames = useCallback(async () => {
    try {
      const { invoke } = window.bridge.ipcRenderer;

      setLoading(true);

      const games = await invoke("games-list");

      setGames(games);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  }, []);

  const handleAddLaunchedGame = useCallback(
    (gamePath: string) => setLaunchedGames((prevState) => [...prevState, gamePath]),
    []
  );

  const handleQuery = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.currentTarget.value),
    []
  );

  return (
    <GamesListStoreContext.Provider
      value={{
        games: filteredGames,
        loading,
        addLaunchedGame: handleAddLaunchedGame,
        launchedGames,
        query,
        setQuery: handleQuery,
      }}
    >
      {children}
    </GamesListStoreContext.Provider>
  );
};

export const useGamesList = () => {
  const store = useContext(GamesListStoreContext);

  if (!store) throw new Error("useGamesList must be used within GamesListStoreProvider");

  return store;
};
