import { ScannerStoreProvider } from "@/storage/ScannerStore";
import { Grid } from "@mui/material";
import Header from "./Header";
import List from "./List";

export default function ScannerList() {
  return (
    <ScannerStoreProvider>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Header />
        </Grid>
        <Grid item xs={12}>
          <List />
        </Grid>
      </Grid>
    </ScannerStoreProvider>
  );
}
