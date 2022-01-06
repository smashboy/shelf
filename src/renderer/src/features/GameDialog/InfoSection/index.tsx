import { Backdrop, Container, Divider, Grid, Paper, Stack } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { useGame } from "@/storage/GameStore";
import { makeStyles } from "@mui/styles";
import { useCallback, useState } from "react";
import DescriptionItem from "./DescriptionItem";
import LargeDescriptionItem from "./LargeDescriptionItem";

const useStyles = makeStyles({
  carouselRoot: {
    width: "90%",
  },
});

interface InfoSectionProps {
  scrollTrigger: boolean;
}

export default function InfoSection(props: InfoSectionProps) {
  const { scrollTrigger } = props;

  const classes = useStyles();

  const { info } = useGame();

  const [image, setImage] = useState<string | null>(null);

  const handleShowImage = useCallback((image: string) => setImage(image), []);
  const handleHideImage = useCallback(() => setImage(null), []);

  return (
    <>
      {info && (
        <Grid container sx={{ paddingTop: 10 }}>
          <Grid container item xs={9} spacing={2} justifyContent="center" flexWrap="wrap">
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
            <Grid item xs={12}>
              <Container maxWidth="md">
                <Grid container rowSpacing={2}>
                  {info.summary && (
                    <Grid item xs={12}>
                      <LargeDescriptionItem title="Summary" description={info.summary} />
                    </Grid>
                  )}
                  {info.storyline && (
                    <Grid item xs={12}>
                      <LargeDescriptionItem title="Storyline" description={info.storyline} />
                    </Grid>
                  )}
                </Grid>
              </Container>
            </Grid>
          </Grid>
          <Grid
            container
            item
            xs={3}
            rowSpacing={2}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ position: "sticky", top: "70px", overflow: "auto", height: "fit-content" }}
          >
            <Grid container item xs={12} justifyContent="center">
              <Stack
                divider={<Divider flexItem />}
                spacing={1}
                component={Paper}
                sx={{
                  padding: 2,
                  height: "fit-content",
                  width: "100%",
                }}
              >
                <DescriptionItem
                  title="Genres"
                  description={info.genres.map((genre) => genre.name).join(", ")}
                />
                <DescriptionItem
                  title="Themes"
                  description={info.themes.map((theme) => theme.name).join(", ")}
                />
                <DescriptionItem
                  title="Release date"
                  description={new Date(info.releaseDate * 1000).toLocaleDateString()}
                />
                <DescriptionItem
                  title="Developers"
                  description={info.companies
                    .filter((company) => company.developer)
                    .map((company) => company.name)
                    .join(", ")}
                />
                <DescriptionItem
                  title="Publishers"
                  description={info.companies
                    .filter((company) => company.publisher)
                    .map((company) => company.name)
                    .join(", ")}
                />
              </Stack>
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
