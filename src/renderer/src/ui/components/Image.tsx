import { useEffect, useState } from "react";
import { ImageState } from "./IconImage";
import StatelessImage, { ImageBaseProps } from "./StatelessImage";
import { fetchImage } from "@/storage/GameStore";

interface ImageProps extends ImageBaseProps {
  type: "cover" | "screenshot" | "artwork";
  imageId: number | string | null;
}

export default function Image(props: ImageProps) {
  const { type, imageId, ...otherProps } = props;

  const [image, setImage] = useState<ImageState>({
    loading: false,
    data: null,
  });

  useEffect(() => {
    async function handleFetchImage() {
      if (!imageId) return;

      setImage((prevState) => ({ ...prevState, loading: true }));

      const data = await fetchImage(type, imageId);

      setImage({ loading: false, data });
    }

    handleFetchImage();
  }, [type, imageId]);

  return <StatelessImage loading={image.loading} image={image.data} {...otherProps} />;
}
