import { useState, useCallback } from "react";
import { Card, CardActionArea, Grid, Backdrop, Typography } from "@mui/material";
import { GameBaseModel } from "src/models/GameModel";
import Image from "./Image";

interface GameBaseCardProps {
  game: GameBaseModel;
  selected?: boolean;
  gridSize?: number;
  onClick?: () => void;
}

export default function GameCard(props: GameBaseCardProps) {
  const { game, selected, gridSize = 2, onClick } = props;

  const [showBackdrop, setShowBackdrop] = useState(false);

  const handleShowBackdrop = useCallback(() => setShowBackdrop(true), []);
  const handleHideBackdrop = useCallback(() => setShowBackdrop(false), []);

  return (
    <Grid item xs={gridSize}>
      <Card
        onClick={() => onClick?.()}
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
          <Image
            type="cover"
            imageId={game.cover}
            containerProps={{ height: "295px" }}
            sx={{ objectFit: "cover", height: "100%" }}
          />
          <Backdrop
            open={showBackdrop}
            sx={{ position: "absolute", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          >
            <Grid container spacing={1} sx={{ paddingX: 0.5 }}>
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
          </Backdrop>
        </CardActionArea>
      </Card>
    </Grid>
  );
}
