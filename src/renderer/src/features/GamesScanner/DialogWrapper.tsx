import { Dialog } from "@mui/material";

import { useScanner } from "@/storage/ScannerStore";

export default function DialogWrapper({ children }: { children: React.ReactNode }) {
  const { open } = useScanner();

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      {children}
    </Dialog>
  );
}
