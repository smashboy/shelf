import { useGame } from "@/storage/GameStore";
import { Divider, Grid, Paper, Stack } from "@mui/material";
import DescriptionItem from "./DescriptionItem";

export default function Sidebar() {
  const { info } = useGame();

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
        <DescriptionItem
          title="Genres"
          description={info!.genres.map((genre) => genre.name).join(", ")}
        />
        <DescriptionItem
          title="Themes"
          description={info!.themes.map((theme) => theme.name).join(", ")}
        />
        <DescriptionItem
          title="Game modes"
          description={info!.modes.map((mode) => mode.name).join(", ")}
        />
        <DescriptionItem
          title="Release date"
          description={new Date(info!.releaseDate * 1000).toLocaleDateString()}
        />
        <DescriptionItem
          title="Developers"
          description={info!.companies
            .filter((company) => company.developer)
            .map((company) => company.name)
            .join(", ")}
        />
        <DescriptionItem
          title="Publishers"
          description={info!.companies
            .filter((company) => company.publisher)
            .map((company) => company.name)
            .join(", ")}
        />
      </Stack>
    </Grid>
  );
}
