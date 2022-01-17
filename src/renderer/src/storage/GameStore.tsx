import { b64toBlob, ImageState } from "@/ui/components/IconImage";
import { timeout } from "@/utils";
import { useSnackbar } from "notistack";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { GameInfoModel, UserGameModelFull } from "src/models/GameModel";
import * as mediaCacheApi from "@/utils/mediaCache";
import BlobWorker from "@/workers/blob2base64?worker";
import { useGamesList } from "./GamesListStore";

interface GameStore {
  game: UserGameModelFull | null;
  info: GameInfoModel | null;
  loading: boolean;
  headerImage: string | null;
  isLoadingGame: boolean;
  images: ImageState[];
  launchGame: () => void;
  setGame: (baseGame: UserGameModelFull) => void;
  close: () => void;
}

const GameStoreContext = createContext<GameStore | null>(null);

export async function fetchImage(type: string, imageId: number | string): Promise<string | null> {
  return new Promise(async (resolve) => {
    try {
      if (!imageId) return;

      const { invoke } = window.bridge.ipcRenderer;

      const cacheBucket = `${type}s`;
      const cacheId = `${type}-${imageId}`;

      const cachedImageBlob = await mediaCacheApi.fetch(
        cacheBucket as mediaCacheApi.CacheName,
        cacheId
      );

      if (cachedImageBlob) {
        resolve(URL.createObjectURL(cachedImageBlob));

        return;
      }

      const image = await invoke("fetch-igdb-image", cacheBucket, imageId);

      if (image) {
        const newImageBlob = b64toBlob(image.replace("data:image/png;base64,", ""), "image/png");

        resolve(URL.createObjectURL(newImageBlob));

        await mediaCacheApi.save(cacheBucket as mediaCacheApi.CacheName, cacheId, newImageBlob);

        return;
      }

      resolve(null);
    } catch (error) {
      console.warn(error);
      resolve(null);
    }
  });
}

export const GameStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const { enqueueSnackbar } = useSnackbar();

  const { addLaunchedGame } = useGamesList();

  const [game, setGame] = useState<UserGameModelFull | null>(null);
  const [info, setGameInfo] = useState<GameInfoModel | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoadingGame, setIsLoadingGame] = useState(false);
  const [images, setImages] = useState<ImageState[]>([]);

  const handleLoadGame = useCallback(async (baseGame: UserGameModelFull) => {
    try {
      const { invoke } = window.bridge.ipcRenderer;

      setGame(baseGame);
      setLoading(true);

      await timeout(500);

      const info = (await invoke("get-game-info", {
        gameSlug: baseGame.slug,
        gameId: baseGame.id,
      })) as GameInfoModel | null;

      setGameInfo(info);
      setLoading(false);

      if (info) handleLoadMedia(info);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, []);

  const handleLoadMedia = useCallback(async (info: GameInfoModel) => {
    const imagesIds = [
      ...info.screenshots.map((id) => ({ key: "screenshot", id })),
      ...info.artworks.map((id) => ({ key: "artwork", id })),
    ];

    if (imagesIds.length === 0) return;

    const loadingPlaceholders = new Array(imagesIds.length).fill({ loading: true, data: null });

    setImages(loadingPlaceholders);

    const promises = imagesIds.map((image) => fetchImage(image.key, image.id));

    const loadedImages = (await Promise.all(promises)).filter((image) => image);

    if (loadedImages.length > 0) {
      setHeaderImage(loadedImages[Math.floor(Math.random() * loadedImages.length)]);

      setImages(loadedImages.map((image) => ({ data: image, loading: false })));
    }
  }, []);

  const handleCloseGame = useCallback(() => {
    setGameInfo(null);
    setGame(null);
    setHeaderImage(null);
    setImages([]);
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
      // @ts-ignore
      enqueueSnackbar(error?.message || "Error launching game", {
        variant: "error",
        preventDuplicate: true,
      });
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
        images,
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
