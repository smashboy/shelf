import { useEffect, useState } from "react";
import { Box, CircularProgress, styled } from "@mui/material";
import { MdImageNotSupported as IconNotFoundIcon } from "react-icons/md";
import rateLimit from "@/utils/rateLimit";
import BlobWorker from "@/workers/blob2base64?worker";
import * as mediaCacheApi from "@/utils/mediaCache";

export interface ImageState {
  loading: boolean;
  data: string | null;
}

interface IconImageProps {
  path: string;
}

export const Image = styled("img")(() => ({
  width: 20,
  height: 20,
}));

async function fetchIcon(path: string, onDone: (icon: string | null) => void) {
  try {
    const { invoke } = window.bridge.ipcRenderer;

    const icon = await invoke("get-path-icon", path);

    onDone(icon);
  } catch (error) {
    console.error(error);
    onDone(null);
  }
}

export const b64toBlob = (b64Data: string, contentType = "", sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

const _RATE_LIMITED_fetchIcon = rateLimit(fetchIcon, 500);

export default function IconImage(props: IconImageProps) {
  const { path } = props;

  const [icon, setIcon] = useState<ImageState>({
    loading: false,
    data: null,
  });

  useEffect(() => {
    async function handleFetchIcon() {
      setIcon((prevState) => ({ ...prevState, loading: true }));

      const cachedIconBlob = await mediaCacheApi.fetch("icons", path);

      if (cachedIconBlob) {
        const worker = new BlobWorker();

        worker.onmessage = (event) => {
          setIcon({ data: event.data, loading: false });
          worker.terminate();
        };
        worker.onerror = (error) => {
          setIcon({ data: null, loading: false });
          console.error(error);
          worker.terminate();
        };

        worker.postMessage({ blob: cachedIconBlob });

        return;
      }

      _RATE_LIMITED_fetchIcon(path, async (data) => {
        setIcon({ data, loading: false });

        if (data)
          await mediaCacheApi.save(
            "icons",
            path,
            b64toBlob(data.replace("data:image/png;base64,", ""), "image/png")
          );
      });
    }

    handleFetchIcon();
  }, []);

  return (
    <Box
      sx={{
        width: 20,
        height: 20,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {icon.loading ? (
        <CircularProgress />
      ) : icon.data ? (
        <Image src={icon.data} />
      ) : (
        <IconNotFoundIcon size={20} />
      )}
    </Box>
  );
}
