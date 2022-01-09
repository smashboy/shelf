import { createContext, useCallback, useContext, useState } from "react";
import type { GameInfoModel, UserGameModelFull } from "src/models/GameModel";
import { useGamesList } from "./GamesListStore";

interface GameStore {
  game: UserGameModelFull | null;
  info: GameInfoModel | null;
  loading: boolean;
  headerImage: string | null;
  isLoadingGame: boolean;
  launchGame: () => void;
  setGame: (baseGame: UserGameModelFull) => void;
  close: () => void;
}

const GameStoreContext = createContext<GameStore | null>(null);

export const GameStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const { addLaunchedGame } = useGamesList();

  const [game, setGame] = useState<UserGameModelFull | null>(null);
  const [info, setGameInfo] = useState<GameInfoModel | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingGame, setIsLoadingGame] = useState(false);

  const handleLoadGame = useCallback(async (baseGame: UserGameModelFull) => {
    try {
      const { invoke } = window.bridge.ipcRenderer;

      setGame(baseGame);
      setLoading(true);

      const info = (await invoke("get-game-info", {
        gameSlug: baseGame.slug,
        gameId: baseGame.id,
      })) as GameInfoModel | null;

      if (info) {
        if (info.artworks.length > 0)
          setHeaderImage(info.artworks[Math.floor(Math.random() * info.artworks.length)].data);

        if (info.screenshots.length > 0)
          setHeaderImage(
            info.screenshots[Math.floor(Math.random() * info.screenshots.length)].data
          );
      }

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
    setHeaderImage(null);
  }, []);

  const handleLaunchGame = useCallback(async () => {
    try {
      const { invoke } = window.bridge.ipcRenderer;

      setIsLoadingGame(true);

      await invoke("launch-game", game!.relatedExecution!);

      addLaunchedGame(game!.relatedExecution!);

      setIsLoadingGame(false);
    } catch (error) {
      setIsLoadingGame(false);
      console.error(error);
    }
  }, [game]);

  return (
    <GameStoreContext.Provider
      value={{
        game,
        info,
        loading,
        headerImage,
        isLoadingGame,
        setGame: handleLoadGame,
        close: handleCloseGame,
        launchGame: handleLaunchGame,
      }}
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
