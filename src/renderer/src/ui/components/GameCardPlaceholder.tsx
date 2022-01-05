import { Grid, Skeleton } from "@mui/material";

export default function GameCardPlaceholder() {
  return (
    <Grid item xs={3}>
      <Skeleton variant="rectangular" width="100%" height={295} sx={{ borderRadius: 1 }} />
    </Grid>
  );
}
