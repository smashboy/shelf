import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MUICarousel from "react-material-ui-carousel";
import { makeStyles } from "@mui/styles";
import { Backdrop, Card, CardActionArea, CardMedia, Grid } from "@mui/material";
import { useGame } from "@/storage/GameStore";
import { Box } from "@mui/system";
import Image from "@/ui/components/Image";

const useStyles = makeStyles({
  carouselRoot: {
    width: "90%",
  },
});

interface PreviewItemProps {
  image: string;
  index: number;
  activeSliderIndex: number;
  onClick: (index: number) => void;
}

function PreviewItem(props: PreviewItemProps) {
  const { image, index, activeSliderIndex, onClick } = props;

  const isActive = useMemo(() => index === activeSliderIndex, [index, activeSliderIndex]);

  // useEffect(() => {
  //   if (index === activeSliderIndex) cardRef.current?.scrollIntoView(false);
  // }, [index, activeSliderIndex]);

  return (
    <Card
      onClick={() => onClick(index)}
      sx={{
        marginRight: 1,
        display: "inline-block",
        border: isActive ? (theme) => `2px solid ${theme.palette.secondary.main}` : undefined,
      }}
    >
      <CardActionArea>
        <CardMedia
          component="img"
          image={image}
          sx={{ width: "120px", minHeight: "70px", maxHeight: "70px" }}
        />
      </CardActionArea>
    </Card>
  );
}

export default function Carousel() {
  const classes = useStyles();

  const [activeSlider, setActiveSlide] = useState(0);

  const { info } = useGame();

  const [image, setImage] = useState<string | null>(null);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    previewContainerRef.current?.scrollTo({
      left: activeSlider * 120,
      behavior: "smooth",
    });
  }, [activeSlider]);

  const handleShowImage = useCallback((image: string) => setImage(image), []);
  const handleHideImage = useCallback(() => setImage(null), []);
  const handleClickPreview = useCallback((newSlide: number) => setActiveSlide(newSlide), []);
  const handleActiveSlider = useCallback((newSlide: number | undefined) => {
    if (newSlide !== undefined) setActiveSlide(newSlide);
  }, []);

  const images = useMemo(
    () => [
      ...info!.screenshots.map((id) => ({ key: "screenshot", id })),
      ...info!.artworks.map((id) => ({ key: "artwork", id })),
    ],
    [info?.artworks, info?.screenshots]
  );

  return (
    <>
      <Grid container rowSpacing={2}>
        <Grid container item xs={12} justifyContent="center">
          <MUICarousel
            className={classes.carouselRoot}
            index={activeSlider}
            autoPlay={false}
            onChange={(now) => handleActiveSlider(now)}
            indicators={false}
            navButtonsProps={{
              style: {
                opacity: 1,
                marginTop: "-20px",
              },
            }}
          >
            {images.map((image) => (
              <Box
                key={`${image.key}-${image.id}`}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  //  onClick={() => handleShowImage(media.data)}
                  // @ts-ignore
                  type={image.key}
                  imageId={image.id}
                  height="auto"
                  containerProps={{
                    width: "80%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  // height="270px"
                  sx={{
                    cursor: "pointer",
                    borderRadius: "4px",
                    // maxHeight: "270px",
                  }}
                />
              </Box>
            ))}
          </MUICarousel>
        </Grid>
        {/* <Grid container item xs={12} justifyContent="center">
          <Box
            ref={previewContainerRef}
            sx={{ overflowX: "auto", width: "65%", whiteSpace: "nowrap" }}
          >
            {images.map((image, index) => (
              <PreviewItem
                key={image.hash}
                image={image.data}
                index={index}
                activeSliderIndex={activeSlider}
                onClick={handleClickPreview}
              />
            ))}
          </Box>
        </Grid> */}
      </Grid>
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
