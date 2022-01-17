import { Box, BoxProps, Skeleton } from "@mui/material";

export interface ImageBaseProps extends Omit<BoxProps<"img">, "component" | "src" | "loading"> {
  containerProps?: BoxProps<"div">;
}

interface StatelessImageProps extends ImageBaseProps {
  loading: boolean;
  image: string | null;
}

export default function StatelessImage(props: StatelessImageProps) {
  const { containerProps, height, loading, image, ...otherProps } = props;

  return (
    <Box {...containerProps} bgcolor={(theme) => theme.palette.background.default}>
      {loading && (
        <Skeleton width="100%" height="100%" variant="rectangular" sx={{ borderRadius: 1 }} />
      )}
      {image && <Box {...otherProps} src={image} component="img" width="100%" />}
    </Box>
  );
}
