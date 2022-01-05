import PaperInput from "@/ui/components/PaperInput";
import { Button, Grid } from "@mui/material";

export default function GamesListHeader() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={8}>
        <PaperInput size="small" placeholder="Search..." />
      </Grid>
      <Grid item xs={2}>
        <Button variant="contained" fullWidth>
          Add Game
        </Button>
      </Grid>
      <Grid item xs={2}>
        <Button variant="contained" fullWidth>
          Scan Computer
        </Button>
      </Grid>
    </Grid>
  );
}
