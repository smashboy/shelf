import { useGame } from "@/storage/GameStore";
import { Container, Grid, Typography } from "@mui/material";
import RatingItem from "./RatingItem";

export default function Rating() {
  const { info } = useGame();

  return (
    <Container maxWidth="md">
      <Typography variant="h5" color="secondary">
        Ratings
      </Typography>
      <Grid container columnSpacing={2} sx={{ marginTop: 2 }}>
        <RatingItem
          title="Total Rating"
          rating={info!.totalRating}
          totalRatingCount={info!.totalRatingCount}
          description="Average rating based on IGDB users and external critic scores"
        />
        <RatingItem
          title="IGDB Rating"
          rating={info!.igdbTotalRating}
          totalRatingCount={info!.igdbTotalRatingCount}
        />
      </Grid>
    </Container>
  );
}
