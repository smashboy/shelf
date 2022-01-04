import { useCallback, useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Badge,
} from "@mui/material";
import IconButton from "@/ui/components/IconButton";
import { MdAdd as AddIcon } from "react-icons/md";
import { GameBaseModel } from "src/models/GameModel";
import GameBaseCard from "@/ui/components/GameBaseCard";
import Button from "@/ui/components/Button";
import { useScanner } from "@/storage/ScannerStore";

interface GameSelectorProps {
  games: GameBaseModel[];
  initialSelect?: GameBaseModel;
  programKey: string;
}

export default function GameSelector(props: GameSelectorProps) {
  const { games, programKey, initialSelect } = props;

  const { selectGame } = useScanner();

  const [open, setOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameBaseModel | null>(null);

  const handleOpen = useCallback(() => {
    if (initialSelect) setSelectedGame(initialSelect);
    setOpen(true);
  }, [initialSelect]);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSelectedGame(null);
  }, []);

  const handleSetGame = useCallback(
    (game: GameBaseModel) => () => {
      if (selectedGame?.slug === game.slug) return setSelectedGame(null);
      setSelectedGame(game);
    },
    [selectedGame]
  );

  const handleConfirmGame = useCallback(() => {
    selectGame(programKey, selectedGame!);
    setOpen(false);
    setSelectedGame(null);
  }, [selectedGame]);

  return (
    <>
      <Box display="flex" width="100%" justifyContent="center" alignItems="center">
        <IconButton color="secondary" onClick={handleOpen}>
          <Badge badgeContent={games.length} color="primary">
            <AddIcon />
          </Badge>
        </IconButton>
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Select Game</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} justifyContent="center" sx={{ paddingY: 3 }}>
            {games.map((game) => (
              <GameBaseCard
                key={game.slug}
                game={game}
                selected={game.slug === selectedGame?.slug}
                backdrop={
                  <Grid container spacing={1} sx={{ paddingX: 0.5 }}>
                    <Grid container item xs={12} justifyContent="center">
                      <Button onClick={handleSetGame(game)} variant="outlined">
                        {game.slug === selectedGame?.slug ? "Cancel" : "Select"}
                      </Button>
                    </Grid>
                    <Grid
                      container
                      item
                      xs={12}
                      justifyContent="center"
                      sx={{ textAlign: "center" }}
                    >
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="contained" color="error">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirmGame} disabled={!selectedGame}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
