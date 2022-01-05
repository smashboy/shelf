import { useGame } from "@/storage/GameStore";
import { Container, Dialog, DialogTitle, Grid, Grow } from "@mui/material";
import CloseButton from "./CloseButton";
import Header from "./Header";
import InfoSection from "./InfoSection";

export default function GameDialog() {
  const { game } = useGame();

  return (
    <Dialog
      TransitionComponent={Grow}
      scroll="paper"
      open={Boolean(game)}
      sx={{
        "& .MuiDialog-paper": {
          position: "relative",
        },
      }}
      fullScreen
    >
      <DialogTitle
        sx={{
          position: "absolute",
          color: (theme) => theme.palette.text.primary,
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        {game?.name}
      </DialogTitle>
      <CloseButton />
      <Grid container>
        <Grid item xs={12}>
          <Header />
        </Grid>
        <Grid item xs={12}>
          <Container maxWidth="xl">
            <InfoSection />
          </Container>
        </Grid>
      </Grid>
    </Dialog>
  );
}
