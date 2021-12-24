import { useView, View } from "@/storage/ViewStore";
import { Backdrop, CircularProgress } from "@mui/material";

export default function LoadingView() {
  const { view } = useView();

  return (
    <Backdrop open={view === View.LOADING}>
      <CircularProgress color="primary" />
    </Backdrop>
  );
}
