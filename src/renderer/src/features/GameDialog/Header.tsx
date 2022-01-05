import { useGame } from "@/storage/GameStore";
import Button from "@/ui/components/Button";
import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import GamePoster from "./GamePoster";

export default function Header() {
  const { game } = useGame();

  return (
    <Box
      sx={{
        width: "100%",
        height: 350,
        backgroundColor: (theme) => theme.palette.background.paper,
        position: "relative",
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{ position: "absolute", bottom: -25, left: 50, maxWidth: "calc(100% - 100px)" }}
      >
        <Grid container item xs={2} justifyContent="center">
          <GamePoster />
        </Grid>
        <Grid item xs={8}>
          <Grid container item spacing={1} xs={12}>
            <Grid item>
              <Button variant="contained">Play</Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="error">
                Delete
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
