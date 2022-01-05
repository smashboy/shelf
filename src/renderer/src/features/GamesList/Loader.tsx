import { useGamesList } from "@/storage/GamesListStore";
import { Grid } from "@mui/material";
import Header from "./Header";
import List from "./List";
import ListPlaceholder from "./ListPlaceholder";

export default function Loader() {
  const { loading } = useGamesList();

  return (
    <>
      {loading ? (
        <ListPlaceholder />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Header />
          </Grid>
          <Grid item xs={12}>
            <List />
          </Grid>
        </Grid>
      )}
    </>
  );
}
