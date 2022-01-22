import { useGamesList } from "@/storage/GamesListStore";
import Button from "@/ui/components/Button";
import PaperInput from "@/ui/components/PaperInput";
import { Grid } from "@mui/material";
import { useCallback, useState } from "react";
import GamesScanner from "../GamesScanner";

export default function GamesListHeader() {
  const { setQuery, query, loadGames } = useGamesList();

  const [openScanner, setOpenScanner] = useState(false);

  const handleOpenScanner = useCallback(() => setOpenScanner(true), []);
  const handleCloseScanner = useCallback(async (addedNewGames?: boolean) => {
    if (addedNewGames) await loadGames();
    setOpenScanner(false);
  }, []);

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <PaperInput value={query} onChange={setQuery} size="small" placeholder="Search..." />
        </Grid>
        <Grid item xs={2}>
          <Button onClick={handleOpenScanner} variant="contained" fullWidth>
            Add Game
          </Button>
        </Grid>
      </Grid>
      <GamesScanner open={openScanner} onClose={handleCloseScanner} />
    </>
  );
}
