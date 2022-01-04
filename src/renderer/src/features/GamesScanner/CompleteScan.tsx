import { Grid, Typography } from "@mui/material";
import LoadingButton from "@/ui/components/LoadingButton";

export default function CompleteScan() {
  return (
    <Grid container spacing={1} sx={{ paddingY: 10 }}>
      <Grid container item xs={12} justifyContent="center">
        <LoadingButton variant="contained">Complete Scan</LoadingButton>
      </Grid>
      <Grid container item xs={12} justifyContent="center">
        <Typography variant="overline">You can add more games at any time</Typography>
      </Grid>
    </Grid>
  );
}
