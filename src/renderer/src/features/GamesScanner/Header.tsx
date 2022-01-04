import { useScanner } from "@/storage/ScannerStore";
import Button from "@/ui/components/Button";
import LoadingButton from "@/ui/components/LoadingButton";
import { Grid } from "@mui/material";

export default function Header() {
  const { scan, cancel, isLoading } = useScanner();

  return (
    <Grid container>
      <Grid item xs={6}>
        <LoadingButton onClick={scan} loading={isLoading}>
          Scan
        </LoadingButton>
      </Grid>
      {isLoading && (
        <Grid item xs={6}>
          <Button onClick={cancel}>Cancel</Button>
        </Grid>
      )}
    </Grid>
  );
}
