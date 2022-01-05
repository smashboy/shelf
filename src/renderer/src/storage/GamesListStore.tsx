import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { GameBaseModel } from "src/models/GameModel";
import { useView, View } from "./ViewStore";

interface GamesListStore {
  games: GameBaseModel[];
  loading: boolean;
}

const GamesListStoreContext = createContext<GamesListStore | null>(null);

export const GamesListStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const { view } = useView();

  const [games, setGames] = useState<GameBaseModel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (view === View.MAIN) handleLoadGames();
  }, [view]);

  const handleLoadGames = async () => {
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
  };

  return (
    <GamesListStoreContext.Provider value={{ games, loading }}>
      {children}
    </GamesListStoreContext.Provider>
  );
};

export const useGamesList = () => {
  const store = useContext(GamesListStoreContext);

  if (!store) throw new Error("useGamesList must be used within GamesListStoreProvider");

  return store;
};
