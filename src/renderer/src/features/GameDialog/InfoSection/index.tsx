import { Backdrop, Box, Divider, Grid, Stack, styled, Typography } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { useGame } from "@/storage/GameStore";
import { makeStyles } from "@mui/styles";
import { useCallback, useState } from "react";

const useStyles = makeStyles({
  carouselRoot: {
    width: "800px",
  },
});

export default function InfoSection() {
  const classes = useStyles();

  const { loading, info, game } = useGame();

  const [image, setImage] = useState<string | null>(null);

  const handleShowImage = useCallback((image: string) => setImage(image), []);
  const handleHideImage = useCallback(() => setImage(null), []);

  return (
    <>
      {info && (
        <Grid container sx={{ paddingTop: 10 }}>
          <Grid item xs={6}></Grid>
          <Grid container item xs={6} spacing={2} justifyContent="center" flexWrap="wrap">
            <Grid container item xs={12} justifyContent="center">
              <Carousel
                className={classes.carouselRoot}
                navButtonsProps={{
                  style: {
                    opacity: 1,
                    marginTop: "-20px",
                  },
                }}
              >
                {[...info.screenshots, ...info.artworks].map((media) => (
                  <img
                    onClick={() => handleShowImage(media.data)}
                    src={media.data}
                    alt={media.hash}
                    width="80%"
                    // height="270px"
                    style={{
                      display: "block",
                      margin: "0 auto",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  />
                ))}
              </Carousel>
            </Grid>
            <Grid container item xs={12} justifyContent="center">
              <Stack divider={<Divider flexItem />} spacing={1} sx={{ width: "75%" }}>
                <Typography variant="subtitle1" component="div" color="text.primary">
                  <b>Genres:</b>{" "}
                  <Typography variant="subtitle2" component="span" color="text.secondary">
                    {info.genres.map((genre) => genre.name).join(", ")}
                  </Typography>
                </Typography>
                <Typography variant="subtitle1" component="div" color="text.primary">
                  <b>Release date:</b>{" "}
                  <Typography variant="subtitle2" component="span" color="text.secondary">
                    {new Date(info.releaseDate * 1000).toLocaleDateString()}
                  </Typography>
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12}>
              {info.summary && (
                <Typography
                  variant="body2"
                  color="text.secondary"
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
                <Typography
                  variant="body2"
                  component="div"
                  color="text.secondary"
                  sx={{ marginTop: 5 }}
                >
                  {info.storyline}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
      )}
      <Backdrop
        open={Boolean(image)}
        onClick={handleHideImage}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        {image && <img src={image} width="75%" style={{ borderRadius: "4px" }} />}
      </Backdrop>
    </>
  );
}
