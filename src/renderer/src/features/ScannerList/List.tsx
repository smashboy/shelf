import { useScanner } from "@/storage/ScannerStore";
import { styled, LinearProgress, Box } from "@mui/material";
import { DataGrid, GridColDef, GridOverlay } from "@mui/x-data-grid";
import { useMemo } from "react";
import LoadingOverlay from "./LoadingOverlay";
import Toolbar from "./Toolbar";

const Image = styled("img")(() => ({
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
        <Image src={params.value} alt="" />
      </Box>
    ),
  },
  { field: "name", headerName: "Name", editable: false, sortable: false, flex: 1 },
  { field: "executionPath", headerName: "Path", editable: false, sortable: false, flex: 1 },
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
  );
}
