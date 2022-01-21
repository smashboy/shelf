import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MUICarousel from "react-material-ui-carousel";
import { makeStyles } from "@mui/styles";
import { Backdrop, Card, CardActionArea, Grid } from "@mui/material";
import { useGame } from "@/storage/GameStore";
import { Box } from "@mui/system";
import StatelessImage from "@/ui/components/StatelessImage";

const useStyles = makeStyles({
  carouselRoot: {
    width: "90%",
  },
});

interface PreviewItemProps {
  image: string;
  index: number;
  loading: boolean;
  activeSliderIndex: number;
  onClick: (index: number) => void;
}

function PreviewItem(props: PreviewItemProps) {
  const { image, loading, index, activeSliderIndex, onClick } = props;

  const isActive = useMemo(() => index === activeSliderIndex, [index, activeSliderIndex]);

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
        <StatelessImage
          loading={loading}
          image={image}
          containerProps={{ sx: { height: "70px", width: "120px" } }}
          sx={{ width: "120px", height: "70px", objectFit: "cover" }}
        />
      </CardActionArea>
    </Card>
  );
}

export default function Carousel() {
  const classes = useStyles();

  const [activeSlider, setActiveSlide] = useState(0);

  const { images } = useGame();

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

  return (
    <>
      <Grid container>
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
            {images.map((image, index) => (
              <Box
                key={`main-${index}`}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <StatelessImage
                  onClick={() => handleShowImage(image.data!)}
                  loading={image.loading}
                  image={image.data}
                  containerProps={{
                    width: "80%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "450px",
                    borderRadius: "4px",
                  }}
                  sx={{
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                />
              </Box>
            ))}
          </MUICarousel>
        </Grid>
        <Grid container item xs={12} justifyContent="center">
          <Box
            ref={previewContainerRef}
            sx={{ overflowX: "auto", width: "65%", whiteSpace: "nowrap" }}
          >
            {images.map((image, index) => (
              <PreviewItem
                key={`preview-${index}`}
                image={image.data!}
                loading={image.loading}
                index={index}
                activeSliderIndex={activeSlider}
                onClick={handleClickPreview}
              />
            ))}
          </Box>
        </Grid>
      </Grid>
      <Backdrop
        open={Boolean(image)}
        onClick={handleHideImage}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        {image && (
          <StatelessImage
            loading={false}
            image={image}
            sx={{ borderRadius: 1, maxHeight: "75vh" }}
            containerProps={{ sx: { backgroundColor: "transparent" } }}
          />
        )}
      </Backdrop>
    </>
  );
}
