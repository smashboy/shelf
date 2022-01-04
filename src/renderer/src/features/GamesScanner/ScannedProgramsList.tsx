import { useScanner } from "@/storage/ScannerStore";
import Alert from "@/ui/components/Alert";
import { styled, Box, Grid } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import LoadingOverlay from "./LoadingOverlay";
import Toolbar from "./Toolbar";

export const ProgramIcon = styled("img")(() => ({
  width: 20,
  height: 20,
}));

const columns: GridColDef[] = [
  {
    field: "icon",
    headerName: "",
    width: 25,
    editable: false,
    sortable: false,
    renderCell: (params) => (
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <ProgramIcon src={params.value} alt="" />
      </Box>
    ),
  },
  { field: "name", headerName: "Name", editable: false, sortable: false, flex: 1 },
  { field: "executionPath", headerName: "Path", editable: false, sortable: false, flex: 1 },
];

export default function ScannedProgramsList() {
  const { isLoading, selectModels, rows, selectedRows } = useScanner();

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Alert severity="warning">Scanning large directories can take a long time.</Alert>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ height: "50vh" }}>
          <DataGrid
            columns={columns}
            loading={isLoading}
            rows={rows}
            selectionModel={selectedRows}
            // @ts-ignore
            onSelectionModelChange={(newSelectionModel) => selectModels(newSelectionModel)}
            components={{
              Toolbar,
              LoadingOverlay,
            }}
            // autoPageSize
            checkboxSelection
            disableSelectionOnClick
            disableColumnMenu
            hideFooter
          />
        </Box>
      </Grid>
    </Grid>
  );
}
