import ScannerList from "@/features/ScannerList";
import { useView, View } from "@/storage/ViewStore";
import Button from "@/ui/components/Button";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
  Stepper,
  StepLabel,
} from "@mui/material";
import { useCallback } from "react";

export default function WelcomeView() {
  const { view, setView } = useView();

  const handleCloseDialog = useCallback(() => setView(View.MAIN), []);

  return (
    <Dialog open={view === View.WELCOME} maxWidth="lg" fullWidth>
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
            <ScannerList />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="error">
          Close
        </Button>
        <Button color="primary">Next</Button>
      </DialogActions>
    </Dialog>
  );
}
