import { useGame } from "@/storage/GameStore";
import { Container, Grid } from "@mui/material";
import LargeDescriptionItem from "./LargeDescriptionItem";

export default function Description() {
  const { info } = useGame();

  return (
    <Container maxWidth="md">
      <Grid container rowSpacing={2}>
        {info!.summary && (
          <Grid item xs={12}>
            <LargeDescriptionItem title="Summary" description={info!.summary} />
          </Grid>
        )}
        {info!.storyline && (
          <Grid item xs={12}>
            <LargeDescriptionItem title="Storyline" description={info!.storyline} />
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
