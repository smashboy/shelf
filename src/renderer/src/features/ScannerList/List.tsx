import { useScanner } from "@/storage/ScannerStore";
import { styled, LinearProgress } from "@mui/material";
import { Box } from "@mui/system";
import { DataGrid, GridRowsProp, GridColDef, GridOverlay } from "@mui/x-data-grid";
import { useMemo } from "react";

const Image = styled("img")(() => ({
  width: 20,
  height: 20,
}));

function CustomLoadingOverlay() {
  return (
    <GridOverlay>
      <Box sx={{ position: "absolute", top: 0, width: "100%" }}>
        <LinearProgress />
      </Box>
    </GridOverlay>
  );
}

const columns: GridColDef[] = [
  {
    field: "icon",
    headerName: "",
    width: 25,
    editable: false,
    sortable: false,
    renderCell: (params) => (
      <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Image src={params.value} alt="" />
      </Box>
    ),
  },
  { field: "name", headerName: "Name", editable: false, sortable: false, flex: 1 },
  { field: "executionPath", headerName: "File", editable: false, sortable: false, flex: 1 },
];

export default function List() {
  const { result, isScanning } = useScanner();

  const rows = useMemo(
    () =>
      result.map(({ icon, name, executionPath }, index) => ({
        id: index,
        icon,
        name,
        executionPath,
      })),
    [result]
  );

  return (
    <Box sx={{ height: "50vh" }}>
      <DataGrid
        columns={columns}
        loading={isScanning}
        rows={rows}
        components={{
          LoadingOverlay: CustomLoadingOverlay,
        }}
        // autoPageSize
        checkboxSelection
        disableSelectionOnClick
        disableColumnMenu
        hideFooter
      />
    </Box>
  );
}
