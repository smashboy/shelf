import { LinearProgress, Box } from "@mui/material";
import { GridOverlay } from "@mui/x-data-grid";

export default function LoadingOverlay() {
  return (
    <GridOverlay>
      <Box sx={{ position: "absolute", top: 0, width: "100%" }}>
        <LinearProgress />
      </Box>
    </GridOverlay>
  );
}
