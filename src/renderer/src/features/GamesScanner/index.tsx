import { DialogContent, Grid, Typography } from "@mui/material";
import { ScannerStoreProvider } from "@/storage/ScannerStore";
import Footer from "./Footer";
import DialogWrapper from "./DialogWrapper";
import ViewSelector from "./ViewSelector";

export interface GamesScannerProps {
  open?: boolean;
  onClose?: (addedNewGames?: boolean) => void;
}

export default function GamesScanner(props: GamesScannerProps) {
  return (
    <ScannerStoreProvider {...props}>
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
