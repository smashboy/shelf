import { Grid, Box, DialogTitle } from "@mui/material";

import { useGame } from "@/storage/GameStore";
import Button from "@/ui/components/Button";
import GamePoster from "./GamePoster";
import GameActions from "./GameActions";

export default function Header() {
  const { headerImage, game } = useGame();

  return (
    <Box
      sx={{
        width: "100%",
        height: 350,
        backgroundColor: (theme) => theme.palette.background.paper,
        backgroundImage: headerImage ? `url(${headerImage})` : undefined,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backdropFilter: "blur(5px)",
        }}
      />
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.background.paper,
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0.35,
          width: "100%",
          height: "100%",
        }}
      />
      <DialogTitle
        sx={{
          color: (theme) => theme.palette.text.primary,
          position: "absolute",
          zIndex: 1,
        }}
      >
        {game?.name}
      </DialogTitle>
      <Grid
        container
        spacing={2}
        sx={{ position: "absolute", bottom: -25, left: 50, maxWidth: "calc(100% - 100px)" }}
      >
        <Grid container item xs={2} justifyContent="center">
          <GamePoster />
        </Grid>
        <Grid container item xs={8} alignItems="flex-end" sx={{ marginBottom: 7 }}>
          <GameActions />
        </Grid>
      </Grid>
    </Box>
  );
}
