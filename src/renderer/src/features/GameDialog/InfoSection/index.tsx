import { Backdrop, Container, Divider, Grid, Stack, styled, Typography } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { useGame } from "@/storage/GameStore";
import { makeStyles } from "@mui/styles";
import { useCallback, useState } from "react";
import DescriptionItem from "./DescriptionItem";

const useStyles = makeStyles({
  carouselRoot: {
    width: "800px",
  },
});

export default function InfoSection() {
  const classes = useStyles();

  const { info } = useGame();

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
              <Stack divider={<Divider flexItem />} spacing={1} sx={{ width: "65%" }}>
                <DescriptionItem
                  title="Genres"
                  description={info.genres.map((genre) => genre.name).join(", ")}
                />
                <DescriptionItem
                  title="Release date"
                  description={new Date(info.releaseDate * 1000).toLocaleDateString()}
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Container>
                <Grid container spacing={2}>
                  {info.summary && (
                    <Grid item xs={12}>
                      <Typography variant="h5" color="primary">
                        Summary
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {info?.summary}
                      </Typography>
                    </Grid>
                  )}
                  {info.storyline && (
                    <Grid item xs={12}>
                      <Typography variant="h5" color="primary">
                        Storyline
                      </Typography>
                      <Typography variant="body2" component="div" color="text.secondary">
                        {info.storyline}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Container>
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
