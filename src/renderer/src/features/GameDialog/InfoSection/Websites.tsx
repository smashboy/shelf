import { useGame } from "@/storage/GameStore";
import { Grid, Paper, Typography } from "@mui/material";
import WebsiteItem, { websiteIcons } from "./WebsiteItem";

export default function Websites() {
  const { info } = useGame();

  return (
    <>
      <Typography variant="h5" color="secondary">
        Socials
      </Typography>
      <Paper sx={{ padding: 2, marginTop: 2 }}>
        <Grid container spacing={1} justifyContent="center">
          {info!.websites
            // @ts-ignore
            .filter((website) => websiteIcons[website.category])
            .map((website) => (
              <WebsiteItem key={website.url} {...website} />
            ))}
        </Grid>
      </Paper>
    </>
  );
}
