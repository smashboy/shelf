import { useCallback, useEffect, useState } from "react";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Badge } from "@mui/material";
import { useDebounce } from "use-debounce";
import IconButton from "@/ui/components/IconButton";
import { MdAdd as AddIcon } from "react-icons/md";
import { GameBaseModel } from "src/models/GameModel";
import GameCard from "@/ui/components/GameCard";
import Button from "@/ui/components/Button";
import { useScanner } from "@/storage/ScannerStore";
import Alert from "@/ui/components/Alert";
import PaperInput from "@/ui/components/PaperInput";

interface GameSelectorProps {
  games: GameBaseModel[];
  initialSelect?: GameBaseModel;
  programKey: string;
}

export default function GameSelector(props: GameSelectorProps) {
  const { games, programKey, initialSelect } = props;

  const { selectGame, textSearchGames } = useScanner();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 1500);
  const [selectedGame, setSelectedGame] = useState<GameBaseModel | null>(null);

  useEffect(() => {
    if (debouncedQuery) textSearchGames(programKey, debouncedQuery);
  }, [debouncedQuery, programKey]);

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

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.currentTarget.value),
    []
  );

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
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Alert severity="info">
                Did not found a game that you need? Try searching for it.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <PaperInput
                value={query}
                onChange={handleSearch}
                placeholder="Search..."
                size="small"
              />
            </Grid>
            <Grid item container xs={12} spacing={2} justifyContent="center" sx={{ paddingY: 3 }}>
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
