import { Backdrop, Box, Grid, styled, Typography } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { useGame } from "@/storage/GameStore";
import { useCallback, useState } from "react";

export default function InfoSection() {
  const { loading, info } = useGame();

  const [image, setImage] = useState<string | null>(null);

  const handleShowImage = useCallback((image: string) => setImage(image), []);
  const handleHideImage = useCallback(() => setImage(null), []);

  return (
    <>
      {info && (
        <Grid container sx={{ paddingTop: 10 }}>
          <Grid item xs={6}></Grid>
          <Grid item xs={6}>
            <Carousel>
              {[...info.screenshots, ...info.artworks].map((media) => (
                <img
                  onClick={() => handleShowImage(media.data)}
                  src={media.data}
                  alt={media.hash}
                  width="480px"
                  height="270px"
                  style={{ display: "block", margin: "0 auto", cursor: "pointer" }}
                />
              ))}
            </Carousel>
            <Box sx={{ marginTop: 3 }}>
              {info.summary && (
                <Typography
                  variant="body2"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {info?.summary}
                </Typography>
              )}
              {info.storyline && (
                <Typography variant="body2" component="div" sx={{ marginTop: 5 }}>
                  {info.storyline}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      )}
      <Backdrop
        open={Boolean(image)}
        onClick={handleHideImage}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        {image && <img src={image} width="75%" />}
      </Backdrop>
    </>
  );
}
