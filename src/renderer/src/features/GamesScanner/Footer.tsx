import { DialogActions } from "@mui/material";
import Button from "@/ui/components/Button";
import { ScannerView, useScanner } from "@/storage/ScannerStore";
import { useCallback } from "react";

export default function Footer() {
  const { selected, view, setView } = useScanner();

  const handleNext = useCallback(() => {
    if (view === ScannerView.PROGRAMS_SCANNER) return setView(ScannerView.GAMES_FINDER);
  }, [view]);

  const handleBack = useCallback(() => setView(ScannerView.PROGRAMS_SCANNER), []);

  return (
    <DialogActions>
      <Button color="error" variant="contained">
        Close
      </Button>
      {view === ScannerView.GAMES_FINDER && (
        <Button color="secondary" variant="contained" onClick={handleBack}>
          Back
        </Button>
      )}
      <Button
        color="primary"
        variant="contained"
        onClick={handleNext}
        disabled={Object.keys(selected).length === 0}
      >
        Next
      </Button>
    </DialogActions>
  );
}
