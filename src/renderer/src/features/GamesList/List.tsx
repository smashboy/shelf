import { useGamesList } from "@/storage/GamesListStore";
import GameCard from "@/ui/components/GameCard";
import { Button, Grid, Typography } from "@mui/material";

export default function List() {
  const { games } = useGamesList();

  return (
    <Grid container spacing={2}>
      {games.map((game, index) => (
        <GameCard
          key={index}
          game={game}
          backdrop={
            <Grid container spacing={1} sx={{ paddingX: 0.5 }}>
              <Grid container item xs={12} justifyContent="center">
                <Button variant="contained" sx={{ width: "75%" }}>
                  Open
                </Button>
              </Grid>
              <Grid container item xs={12} justifyContent="center">
                <Button variant="outlined" sx={{ width: "75%" }}>
                  Play
                </Button>
              </Grid>
              <Grid container item xs={12} justifyContent="center" sx={{ textAlign: "center" }}>
                <Typography
                  variant="subtitle1"
                  component="div"
                  // sx={{ position: "absolute", bottom: 5, left: 5, width: "100%" }}
                >
                  {game.name}
                </Typography>
              </Grid>
            </Grid>
          }
        />
      ))}
    </Grid>
  );
}
