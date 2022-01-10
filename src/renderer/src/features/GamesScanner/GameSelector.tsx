import { useCallback, useState } from "react";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Badge } from "@mui/material";
import IconButton from "@/ui/components/IconButton";
import { MdAdd as AddIcon } from "react-icons/md";
import { GameBaseModel } from "src/models/GameModel";
import GameCard from "@/ui/components/GameCard";
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
              <GameCard
                key={game.slug}
                game={game}
                gridSize={3}
                onClick={handleSetGame(game)}
                selected={game.slug === selectedGame?.slug}
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
