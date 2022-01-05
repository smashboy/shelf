import { useGame } from "@/storage/GameStore";
import { Card, CardMedia } from "@mui/material";

export default function GamePoster() {
  const { game } = useGame();

  return (
    <Card sx={{ pointerEvents: "none", width: "175px", height: "235px" }}>
      {game?.cover?.data && (
        <CardMedia
          component="img"
          width="175px"
          height="235px"
          image={game!.cover.data}
          alt={game!.name}
        />
      )}
    </Card>
  );
}
