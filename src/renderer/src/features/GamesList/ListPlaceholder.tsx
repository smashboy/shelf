import GameCardPlaceholder from "@/ui/components/GameCardPlaceholder";
import { Grid, Skeleton } from "@mui/material";

const placeholders = new Array(25).fill(null);

export default function ListPlaceholder() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={8}>
        <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
      </Grid>
      <Grid item xs={2}>
        <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
      </Grid>
      <Grid item xs={2}>
        <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
      </Grid>
      <Grid container item xs={12} spacing={2}>
        {placeholders.map((_, index) => (
          <GameCardPlaceholder key={index} />
        ))}
      </Grid>
    </Grid>
  );
}
