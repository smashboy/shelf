import {
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Typography,
  Step,
  Stepper,
  StepLabel,
} from "@mui/material";
import { ScannerView, useScanner } from "@/storage/ScannerStore";
import ScannedProgramsList from "./ScannedProgramsList";
import GamesFinderList from "./GamesFinderList";
import CompleteScan from "./CompleteScan";

function ViewSelectorContent() {
  const { view } = useScanner();

  switch (view) {
    case ScannerView.PROGRAMS_SCANNER:
      return <ScannedProgramsList />;
    case ScannerView.GAMES_FINDER:
      return <GamesFinderList />;
    case ScannerView.FINISH_SCAN:
      return <CompleteScan />;
    default:
      return null;
  }
}

export default function ViewSelector() {
  const { view } = useScanner();

  return (
    <>
      <Stepper sx={{ paddingY: 2 }}>
        <Step
          completed={view !== ScannerView.PROGRAMS_SCANNER}
          active={view === ScannerView.PROGRAMS_SCANNER}
        >
          <StepLabel>Scan Programs</StepLabel>
        </Step>
        <Step
          completed={view === ScannerView.FINISH_SCAN}
          active={view === ScannerView.GAMES_FINDER}
        >
          <StepLabel>Find Games</StepLabel>
        </Step>
        <Step active={view === ScannerView.FINISH_SCAN}>
          <StepLabel>Complete Scan</StepLabel>
        </Step>
      </Stepper>
      <ViewSelectorContent />
    </>
  );
}
