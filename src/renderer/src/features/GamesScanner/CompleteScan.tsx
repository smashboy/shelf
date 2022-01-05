import { Grid, Typography } from "@mui/material";
import LoadingButton from "@/ui/components/LoadingButton";
import { useScanner } from "@/storage/ScannerStore";

export default function CompleteScan() {
  const { isLoading, addGames } = useScanner();

  return (
    <Grid container spacing={1} sx={{ paddingY: 10 }}>
      <Grid container item xs={12} justifyContent="center">
        <LoadingButton loading={isLoading} onClick={addGames} variant="contained">
          Complete Scan
        </LoadingButton>
      </Grid>
      <Grid container item xs={12} justifyContent="center">
        <Typography variant="overline">You can add more games at any time</Typography>
      </Grid>
    </Grid>
  );
}
