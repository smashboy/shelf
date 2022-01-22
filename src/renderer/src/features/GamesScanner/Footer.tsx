import { DialogActions } from "@mui/material";
import Button from "@/ui/components/Button";
import { ScannerView, useScanner } from "@/storage/ScannerStore";
import { useCallback } from "react";

export default function Footer() {
  const { selected, view, setView, close } = useScanner();

  const handleNext = useCallback(() => {
    switch (view) {
      case ScannerView.PROGRAMS_SCANNER:
        setView(ScannerView.GAMES_FINDER);
        break;
      case ScannerView.GAMES_FINDER:
        setView(ScannerView.FINISH_SCAN);
        break;
      default:
        break;
    }
  }, [view]);

  const handleBack = useCallback(() => {
    switch (view) {
      case ScannerView.FINISH_SCAN:
        setView(ScannerView.GAMES_FINDER);
        break;
      case ScannerView.GAMES_FINDER:
        setView(ScannerView.PROGRAMS_SCANNER);
        break;
      default:
        break;
    }
  }, [view]);

  return (
    <DialogActions>
      <Button onClick={close} color="error" variant="contained">
        Close
      </Button>
      {view !== ScannerView.PROGRAMS_SCANNER && (
        <Button color="secondary" variant="contained" onClick={handleBack}>
          Back
        </Button>
      )}
      {view !== ScannerView.FINISH_SCAN && (
        <Button
          color="primary"
          variant="contained"
          onClick={handleNext}
          disabled={
            (view === ScannerView.PROGRAMS_SCANNER && Object.keys(selected).length === 0) ||
            (view === ScannerView.GAMES_FINDER &&
              Object.values(selected).filter(({ selectedGame }) => selectedGame).length === 0)
          }
        >
          Next
        </Button>
      )}
    </DialogActions>
  );
}
