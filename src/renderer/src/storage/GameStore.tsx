import { createContext, useCallback, useContext, useState } from "react";
import type { GameBaseModel, GameInfoModel, GameModel } from "src/models/GameModel";

interface GameStore {
  game: GameBaseModel | null;
  info: GameInfoModel | null;
  loading: boolean;
  setGame: (baseGame: GameBaseModel) => void;
  close: () => void;
}

const GameStoreContext = createContext<GameStore | null>(null);

export const GameStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [game, setGame] = useState<GameBaseModel | null>(null);
  const [info, setGameInfo] = useState<GameInfoModel | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoadGame = useCallback(async (baseGame: GameBaseModel) => {
    try {
      const { invoke } = window.bridge.ipcRenderer;

      setGame(baseGame);
      setLoading(true);

      const info = await invoke("get-game-info", { gameSlug: baseGame.slug, gameId: baseGame.id });

      setGameInfo(info);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, []);

  const handleCloseGame = useCallback(() => {
    setGameInfo(null);
    setGame(null);
  }, []);

  return (
    <GameStoreContext.Provider
      value={{ game, info, loading, setGame: handleLoadGame, close: handleCloseGame }}
    >
      {children}
    </GameStoreContext.Provider>
  );
};

export const useGame = () => {
  const store = useContext(GameStoreContext);

  if (!store) throw new Error("useGame must be used within GameStoreProvider");

  return store;
};
