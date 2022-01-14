import { useGame } from "@/storage/GameStore";
import Image from "@/ui/components/Image";
import { Card } from "@mui/material";

export default function GamePoster() {
  const { game } = useGame();

  return (
    <Card sx={{ pointerEvents: "none", width: "175px", height: "235px" }}>
      {game?.cover && <Image type="cover" imageId={game.cover} alt={game!.name} />}
    </Card>
  );
}
