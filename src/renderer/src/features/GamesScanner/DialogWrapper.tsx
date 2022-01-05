import { Dialog } from "@mui/material";
import { useView, View } from "@/storage/ViewStore";

export default function DialogWrapper({ children }: { children: React.ReactNode }) {
  const { view } = useView();

  return (
    <Dialog open={view === View.WELCOME} maxWidth="lg" fullWidth>
      {children}
    </Dialog>
  );
}
