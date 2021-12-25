import { ScannerStoreProvider } from "@/storage/ScannerStore";
import Alert from "@/ui/components/Alert";
import { Grid } from "@mui/material";
import Header from "./Header";
import List from "./List";

export default function ScannerList() {
  return (
    <ScannerStoreProvider>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Alert severity="warning">Scanning large directories can take a long time.</Alert>
        </Grid>
        <Grid item xs={12}>
          <List />
        </Grid>
      </Grid>
    </ScannerStoreProvider>
  );
}
