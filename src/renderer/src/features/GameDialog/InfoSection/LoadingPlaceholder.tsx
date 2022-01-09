import { Skeleton, Grid, Container, Stack, Divider, Paper } from "@mui/material";

const carouselitemsPlaceholder = new Array(5).fill(null);
const ratingItemsPlaceholder = new Array(4).fill(null);
const sidebarItemsPlaceholder = new Array(6).fill(null);

function CarouselPlaceholder() {
  return (
    <Grid container rowSpacing={2}>
      <Grid container item xs={12} justifyContent="center">
        <Skeleton variant="rectangular" width="800px" height="450px" sx={{ borderRadius: 1 }} />
      </Grid>
      <Grid container item xs={12} justifyContent="center">
        {carouselitemsPlaceholder.map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            width="120px"
            height="70px"
            sx={{ marginRight: 1, borderRadius: 1 }}
          />
        ))}
      </Grid>
    </Grid>
  );
}

function DescriptionPlaceholder() {
  return (
    <Grid container rowSpacing={2}>
      <Grid item xs={12}>
        <Skeleton width={175} />
      </Grid>
      <Grid item xs={12} sx={{ padding: 2 }}>
        <Skeleton width="100%" />
        <Skeleton width="100%" />
        <Skeleton width="100%" />
      </Grid>
    </Grid>
  );
}

function WebsitesPlaceholder() {
  return (
    <Grid container rowSpacing={2}>
      <Grid item xs={12}>
        <Skeleton width={175} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton
          variant="rectangular"
          width="100%"
          height="78px"
          sx={{ marginRight: 1, borderRadius: 1 }}
        />
      </Grid>
    </Grid>
  );
}

function RatingsPlaceholder() {
  return (
    <Grid container rowSpacing={2}>
      <Grid item xs={12}>
        <Skeleton width={175} />
      </Grid>
      <Grid container item xs={12} columnSpacing={2}>
        {ratingItemsPlaceholder.map((_, index) => (
          <Grid key={index} item xs={3}>
            <Skeleton variant="rectangular" width="100%" height="275px" sx={{ borderRadius: 1 }} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}

function SidebarPlaceholder() {
  return (
    <Grid container item xs={12} justifyContent="center">
      <Stack
        divider={<Divider flexItem />}
        spacing={1}
        component={Paper}
        sx={{
          padding: 2,
          height: "fit-content",
          width: "100%",
        }}
      >
        {sidebarItemsPlaceholder.map((_, index) => (
          <div key={index}>
            <Grid container columnSpacing={2}>
              <Grid item xs={3}>
                <Skeleton width="100%" />
              </Grid>
              <Grid item xs={9}>
                <Skeleton width="100%" />
              </Grid>
            </Grid>
          </div>
        ))}
      </Stack>
    </Grid>
  );
}

export default function LoadingPlaceholder() {
  return (
    <Grid container sx={{ paddingTop: 10 }}>
      <Grid container item xs={9} rowSpacing={2} justifyContent="center">
        <Grid container item xs={12} justifyContent="center">
          <CarouselPlaceholder />
        </Grid>
        <Container maxWidth="md" sx={{ marginTop: 2 }}>
          <Grid container rowSpacing={2}>
            <Grid item xs={12}>
              <DescriptionPlaceholder />
            </Grid>
            <Grid item xs={12}>
              <DescriptionPlaceholder />
            </Grid>
            <Grid item xs={12}>
              <WebsitesPlaceholder />
            </Grid>
            <Grid item xs={12}>
              <RatingsPlaceholder />
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
        <SidebarPlaceholder />
      </Grid>
    </Grid>
  );
}
