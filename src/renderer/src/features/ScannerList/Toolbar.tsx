import { useScanner } from "@/storage/ScannerStore";
import Button from "@/ui/components/Button";
import Input from "@/ui/components/Input";
import { GridToolbarContainer } from "@mui/x-data-grid";

export default function Toolbar() {
  const { scan } = useScanner();

  return (
    <GridToolbarContainer>
      <Button>Browse...</Button>
      <Button onClick={scan}>Scan Directory</Button>
      <Button>Detect installed</Button>
      <Input size="small" />
    </GridToolbarContainer>
  );
}
