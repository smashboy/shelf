import { b64toBlob, ImageState } from "@/ui/components/IconImage";
import { useSnackbar } from "notistack";
import { createContext, useCallback, useContext, useState } from "react";
import type { GameInfoModel, UserGameModelFull } from "src/models/GameModel";
import * as mediaCacheApi from "@/utils/mediaCache";
import { useGamesList } from "./GamesListStore";
import rateLimit from "@/utils/rateLimit";

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

async function fetchCachedImage(
  cacheBucket: mediaCacheApi.CacheName,
  cacheId: string
): Promise<string | null> {
  const cachedImageBlob = await mediaCacheApi.fetch(cacheBucket, cacheId);

  if (cachedImageBlob) return URL.createObjectURL(cachedImageBlob);

  return cachedImageBlob;
}

async function fetchNewImage(
  imageId: string | number,
  cacheBucket: mediaCacheApi.CacheName,
  cacheId: string
) {
  const { invoke } = window.bridge.ipcRenderer;

  const image = await invoke("fetch-igdb-image", cacheBucket, imageId);

  if (image) {
    const newImageBlob = b64toBlob(image.replace("data:image/webp;base64,", ""), "image/webp");
    await mediaCacheApi.save(cacheBucket as mediaCacheApi.CacheName, cacheId, newImageBlob);

    return URL.createObjectURL(newImageBlob);
  }

  return null;
}

async function fetchNewImageRateLimitWrapper(
  imageId: string | number,
  cacheBucket: mediaCacheApi.CacheName,
  cacheId: string,
  onDone: (image: string | null) => void
) {
  const image = await fetchNewImage(imageId, cacheBucket, cacheId);
  onDone(image);
}

const _RATE_LIMITED_fetchNewImage = rateLimit(fetchNewImageRateLimitWrapper, 300);

export function fetchImage(
  type: string,
  imageId: number | string,
  rateLimited?: boolean
): Promise<string | null> {
  return new Promise(async (resolve) => {
    try {
      if (!imageId) return resolve(null);

      const cacheBucket = `${type}s`;
      const cacheId = `${type}-${imageId}`;

      const cachedImage = await fetchCachedImage(cacheBucket as mediaCacheApi.CacheName, cacheId);

      if (cachedImage) return resolve(cachedImage);

      if (rateLimited)
        return _RATE_LIMITED_fetchNewImage(
          imageId,
          cacheBucket as mediaCacheApi.CacheName,
          cacheId,
          (image) => resolve(image)
        );

      const newImage = await fetchNewImage(
        imageId,
        cacheBucket as mediaCacheApi.CacheName,
        cacheId
      );

      resolve(newImage);
    } catch (error) {
      console.warn(error);
      resolve(null);
    }
  });
}

export function GameStoreProvider({ children }: { children: React.ReactNode }) {
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

    const loadedImages: string[] = [];

    for (const index in imagesIds) {
      const imageMeta = imagesIds[index];

      const image = await fetchImage(imageMeta.key, imageMeta.id, true);

      if (image) {
        loadedImages.push(image);
        setImages((prevState) => {
          const updatedState = [...prevState];
          updatedState[index] = { data: image, loading: false };
          return updatedState;
        });
      }
    }

    if (loadedImages.length > 0)
      setHeaderImage(loadedImages[Math.floor(Math.random() * loadedImages.length)]);
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
}

export function useGame() {
  const store = useContext(GameStoreContext);

  if (!store) throw new Error("useGame must be used within GameStoreProvider");

  return store;
}
