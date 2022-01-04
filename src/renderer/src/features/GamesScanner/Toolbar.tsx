import { useScanner } from "@/storage/ScannerStore";
import Button from "@/ui/components/Button";
import Input from "@/ui/components/Input";
import { GridToolbarContainer } from "@mui/x-data-grid";

export default function Toolbar() {
  const { scan, detect, scanFile, isLoading } = useScanner();

  return (
    <GridToolbarContainer>
      <Button onClick={scanFile} disabled={isLoading}>
        Browse...
      </Button>
      <Button onClick={scan} disabled={isLoading}>
        Scan Directory
      </Button>
      <Button onClick={detect} disabled={isLoading}>
        Detect installed
      </Button>
      <Input size="small" disabled={isLoading} />
    </GridToolbarContainer>
  );
}
