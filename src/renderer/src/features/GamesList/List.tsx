import { useGamesList } from "@/storage/GamesListStore";
import { useGame } from "@/storage/GameStore";
import GameCard from "@/ui/components/GameCard";
import { Grid } from "@mui/material";

export default function List() {
  const { setGame } = useGame();
  const { games } = useGamesList();

  return (
    <Grid container spacing={2}>
      {games.map((game) => (
        <GameCard key={game.id} game={game} onClick={() => setGame(game)} />
      ))}
    </Grid>
  );
}
