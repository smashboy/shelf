import { useCallback, useState } from "react";
import MUICarousel from "react-material-ui-carousel";
import { makeStyles } from "@mui/styles";
import { Backdrop } from "@mui/material";
import { useGame } from "@/storage/GameStore";

const useStyles = makeStyles({
  carouselRoot: {
    width: "90%",
  },
});

export default function Carousel() {
  const classes = useStyles();

  const { info } = useGame();

  const [image, setImage] = useState<string | null>(null);

  const handleShowImage = useCallback((image: string) => setImage(image), []);
  const handleHideImage = useCallback(() => setImage(null), []);

  return (
    <>
      <MUICarousel
        className={classes.carouselRoot}
        navButtonsProps={{
          style: {
            opacity: 1,
            marginTop: "-20px",
          },
        }}
      >
        {[...info!.screenshots, ...info!.artworks].map((media) => (
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
      </MUICarousel>
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
