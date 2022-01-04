import { DialogContent, Grid, Typography } from "@mui/material";
import { ScannerStoreProvider } from "@/storage/ScannerStore";
import Alert from "@/ui/components/Alert";
import Footer from "./Footer";
import DialogWrapper from "./DialogWrapper";
import ViewSelector from "./ViewSelector";

interface GamesScannerProps {
  open?: boolean;
}

export default function GamesScanner(props: GamesScannerProps) {
  const { open } = props;

  return (
    <ScannerStoreProvider>
      <DialogWrapper>
        <DialogContent>
          <Grid container spacing={1}>
            <Grid container item xs={12} justifyContent="center">
              <Typography variant="h4">Welcome to Shelf</Typography>
            </Grid>
            <Grid container item xs={12} justifyContent="center">
              <Typography variant="subtitle2" color="text.secondary">
                Lets start by adding some games to your library
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <ViewSelector />
            </Grid>
          </Grid>
        </DialogContent>
        <Footer />
      </DialogWrapper>
    </ScannerStoreProvider>
  );
}
