import { useEffect, useState } from "react";
import { Box, BoxProps } from "@mui/material";
import * as mediaCacheApi from "@/utils/mediaCache";
import BlobWorker from "@/workers/blob2base64?worker";
import BufferWorker from "@/workers/buffer2base64?worker";
import { b64toBlob, ImageState } from "./IconImage";

interface ImageProps extends Omit<BoxProps<"img">, "component" | "src"> {
  containerProps?: BoxProps<"div">;
  height: number | string;
  type: "cover" | "screenshot" | "artwork";
  imageId: number | string | null;
}

export default function Image(props: ImageProps) {
  const { containerProps, height, type, imageId, ...otherProps } = props;

  const [image, setImage] = useState<ImageState>({
    loading: false,
    data: null,
  });

  useEffect(() => {
    async function handleFetchImage() {
      try {
        if (!imageId) return;

        const { invoke } = window.bridge.ipcRenderer;

        setImage((prevState) => ({ ...prevState, loading: true }));

        const cacheBucket = `${type}s`;
        const cacheId = `${type}-${imageId}`;

        const cachedImageBlob = await mediaCacheApi.fetch(
          cacheBucket as mediaCacheApi.CacheName,
          cacheId
        );

        if (cachedImageBlob) {
          const worker = new BlobWorker();

          worker.onmessage = (event) => {
            setImage({ data: event.data, loading: false });
            worker.terminate();
          };
          worker.onerror = (error) => {
            setImage({ data: null, loading: false });
            console.error(error);
            worker.terminate();
          };

          worker.postMessage({ blob: cachedImageBlob });

          return;
        }

        const image = await invoke("fetch-igdb-image", cacheBucket, imageId);

        if (image) {
          setImage({ data: image, loading: false });
          await mediaCacheApi.save(
            cacheBucket as mediaCacheApi.CacheName,
            cacheId,
            b64toBlob(image.replace("data:image/png;base64,", ""), "image/png")
          );

          return;
        }

        setImage({ data: null, loading: false });
      } catch (error) {
        setImage({ data: null, loading: false });
      }
    }

    handleFetchImage();
  }, []);

  return (
    <Box {...containerProps} height={height}>
      {image.data && (
        <Box {...otherProps} src={image.data} component="img" width="100%" height={height} />
      )}
    </Box>
  );
}
