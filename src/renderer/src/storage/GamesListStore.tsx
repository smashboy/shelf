import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { UserGameModelFull } from "src/models/GameModel";
import { useView, View } from "./ViewStore";

interface GamesListStore {
  games: UserGameModelFull[];
  loading: boolean;
  launchedGames: string[];
  addLaunchedGame: (gamePath: string) => void;
}

const GamesListStoreContext = createContext<GamesListStore | null>(null);

export const GamesListStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const { view } = useView();

  const [games, setGames] = useState<UserGameModelFull[]>([]);
  const [launchedGames, setLaunchedGames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <GamesListStoreContext.Provider
      value={{ games, loading, addLaunchedGame: handleAddLaunchedGame, launchedGames }}
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
