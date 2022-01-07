import { CircularProgress, Box, Typography, Grid, Paper } from "@mui/material";

interface RatingItemProps {
  rating: number;
  totalRatingCount: number;
  title: string;
  description?: string;
}

export default function RatingItem(props: RatingItemProps) {
  const { rating, totalRatingCount, title, description } = props;

  return (
    <Grid item xs={3}>
      <Paper
        sx={{
          padding: 2,
          height: "100%",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography
              variant="h6"
              component="div"
              color="text.primary"
              sx={{ textAlign: "center" }}
            >
              {title}
            </Typography>
          </Grid>
          <Grid container item xs={12} justifyContent="center">
            <Box sx={{ position: "relative", display: "inline-flex" }}>
              <CircularProgress variant="determinate" value={rating} size={75} />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="caption" component="div" color="text.secondary">{`${Math.round(
                  rating
                )}%`}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant="overline"
              component="div"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              User ratings: {totalRatingCount}
            </Typography>
            {description && (
              <Typography
                variant="subtitle2"
                component="div"
                color="text.secondary"
                sx={{ marginTop: 1, textAlign: "center" }}
              >
                {description}
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
}
