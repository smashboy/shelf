import { Container, Grid } from "@mui/material";
import { useGame } from "@/storage/GameStore";
import Sidebar from "./Sidebar";
import Carousel from "./Carousel";
import Description from "./Description";
import Rating from "./Rating";
import Websites from "./Websites";

export default function InfoSection() {
  const { info } = useGame();

  return (
    <>
      {info && (
        <Grid container sx={{ paddingTop: 10 }}>
          <Grid container item xs={9} rowSpacing={2} justifyContent="center">
            <Grid container item xs={12} justifyContent="center">
              <Carousel />
            </Grid>
            <Container maxWidth="md" sx={{ marginTop: 2 }}>
              <Grid container rowSpacing={2}>
                <Grid item xs={12}>
                  <Description />
                </Grid>
                <Grid item xs={12}>
                  <Websites />
                </Grid>
                <Grid item xs={12}>
                  <Rating />
                </Grid>
              </Grid>
            </Container>
          </Grid>
          <Grid
            container
            item
            xs={3}
            rowSpacing={2}
            justifyContent="center"
            flexWrap="wrap"
            sx={{ position: "sticky", top: "70px", overflow: "auto", height: "fit-content" }}
          >
            <Sidebar />
          </Grid>
        </Grid>
      )}
    </>
  );
}
