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
import { scannerSteps, ScannerView, useScanner } from "@/storage/ScannerStore";
import ScannedProgramsList from "./ScannedProgramsList";
import GamesFinderList from "./GamesFinderList";

function ViewSelectorContent() {
  const { view } = useScanner();

  switch (view) {
    case ScannerView.PROGRAMS_SCANNER:
      return <ScannedProgramsList />;
    case ScannerView.GAMES_FINDER:
      return <GamesFinderList />;
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
          completed={view === ScannerView.GAMES_FINDER}
          active={view === ScannerView.PROGRAMS_SCANNER}
        >
          <StepLabel>Scan Programs</StepLabel>
        </Step>
        <Step>
          <StepLabel>Find Games</StepLabel>
        </Step>
      </Stepper>
      <ViewSelectorContent />
    </>
  );
}
