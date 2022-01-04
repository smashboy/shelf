import { useState, useCallback } from "react";
import { Card, CardActionArea, CardMedia, Grid, Backdrop } from "@mui/material";
import { GameBaseModel } from "src/models/GameModel";

interface GameBaseCardProps {
  game: GameBaseModel;
  backdrop?: React.ReactNode;
  selected?: boolean;
}

export default function GameBaseCard(props: GameBaseCardProps) {
  const { game, backdrop, selected } = props;

  const [showBackdrop, setShowBackdrop] = useState(false);

  const handleShowBackdrop = useCallback(() => {
    if (backdrop) setShowBackdrop(true);
  }, [backdrop]);
  const handleHideBackdrop = useCallback(() => setShowBackdrop(false), []);

  return (
    <Grid item xs={3}>
      <Card
        sx={{
          height: "100%",
          position: "relative",
          boxShadow: selected
            ? (theme) => `0px 0px 10px 0px ${theme.palette.primary.main}`
            : undefined,
        }}
        onMouseEnter={handleShowBackdrop}
        onMouseLeave={handleHideBackdrop}
      >
        <CardActionArea sx={{ height: "100%" }} component="div">
          {game.cover?.data && (
            <CardMedia component="img" height="295px" image={game.cover.data} alt={game.name} />
          )}
          {backdrop && (
            <Backdrop
              open={showBackdrop}
              sx={{ position: "absolute", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
              {backdrop}
            </Backdrop>
          )}
        </CardActionArea>
      </Card>
    </Grid>
  );
}
