import { useRef } from "react";
import {
  Container,
  DialogTitle,
  Grid,
  Grow,
  useScrollTrigger,
  SxProps,
  Theme,
  Box,
  Slide,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useGame } from "@/storage/GameStore";
import Dialog from "@/ui/components/Dialog";
import CloseButton from "./CloseButton";
import Header from "./Header";
import InfoSection from "./InfoSection";
import GameActions from "./GameActions";

export default function GameDialog() {
  const { game, close } = useGame();

  const containerRef = useRef(null);

  const scrollTrigger = useScrollTrigger({
    target: containerRef.current || undefined,
    threshold: 235,
  });

  return (
    <Dialog
      TransitionComponent={Grow}
      scroll="paper"
      open={Boolean(game)}
      onClose={close}
      sx={{
        "& .MuiDialog-paper": {
          position: "relative",
          overflow: "hidden",
        },
      }}
      fullScreen
    >
      <Box ref={containerRef} sx={{ overflowY: "auto" }}>
        <Slide in={scrollTrigger} direction="down">
          <DialogTitle
            sx={{
              color: (theme) => theme.palette.text.primary,
              zIndex: 10,
              pointerEvents: "none",
              position: "absolute",
              width: "100%",
              backgroundColor: (theme) => alpha(theme.palette.background.default, 0.25),
              backdropFilter: "blur(10px)",
              display: "flex",
              flexWrap: "nowrap",
            }}
            // @ts-ignore
            component="div"
          >
            {game?.name}
            <Box sx={{ marginLeft: 3 }}>
              <GameActions />
            </Box>
          </DialogTitle>
        </Slide>
        <CloseButton />
        <Grid container>
          <Grid item xs={12}>
            <Header />
          </Grid>
          <Grid item xs={12}>
            <Container maxWidth="xl">
              <InfoSection scrollTrigger={scrollTrigger} />
            </Container>
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
}
