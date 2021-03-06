import { useScanner } from "@/storage/ScannerStore";
import Alert from "@/ui/components/Alert";
import IconImage from "@/ui/components/IconImage";
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
        <IconImage path={params.row.executionPath} />
      </Box>
    ),
  },
  { field: "name", headerName: "Name", editable: false, sortable: false, flex: 1 },
  { field: "executionPath", headerName: "Path", editable: false, sortable: false, flex: 1 },
];

export default function ScannedProgramsList() {
  const { isLoading, selectModels, rows, selectedRows, filteredRows, filter, setFilter } =
    useScanner();

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Alert severity="warning">Scanning large directories can take a long time.</Alert>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ height: "50vh" }}>
          <DataGrid
            // Virtualization not properly triggers cell mount
            disableVirtualization
            columns={columns}
            loading={isLoading}
            rows={filter ? filteredRows : rows}
            selectionModel={selectedRows}
            // @ts-ignore
            onSelectionModelChange={(newSelectionModel) => selectModels(newSelectionModel)}
            components={{
              Toolbar,
              LoadingOverlay,
            }}
            componentsProps={{
              toolbar: {
                value: filter,
                onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                  setFilter(event.target.value),
                clearSearch: () => setFilter(""),
              },
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
