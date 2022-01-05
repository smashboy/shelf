import { useScanner } from "@/storage/ScannerStore";
import Button from "@/ui/components/Button";
import Input from "@/ui/components/Input";
import { Grid } from "@mui/material";
import { GridToolbarContainer } from "@mui/x-data-grid";

interface ToolbarProps {
  clearSearch: () => void;
  onChange: () => void;
  value: string;
}

export default function Toolbar(props: ToolbarProps) {
  const { scan, detect, scanFile, isLoading } = useScanner();

  return (
    <GridToolbarContainer>
      <Grid container columnSpacing={1}>
        <Grid item xs={9}>
          <Button onClick={scanFile} disabled={isLoading}>
            Browse...
          </Button>
          <Button onClick={scan} disabled={isLoading}>
            Scan Directory
          </Button>
          <Button onClick={detect} disabled={isLoading}>
            Detect installed
          </Button>
        </Grid>
        {/* <Grid item xs={3}>
          <Input
            value={value}
            onChange={onChange}
            size="small"
            placeholder="Search..."
            disabled={isLoading}
            fullWidth
          />
        </Grid> */}
      </Grid>
    </GridToolbarContainer>
  );
}
