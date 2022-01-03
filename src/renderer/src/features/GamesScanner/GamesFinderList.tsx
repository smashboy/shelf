import { useEffect, useMemo } from "react";
import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useScanner } from "@/storage/ScannerStore";
import { ProgramIcon } from "./ScannedProgramsList";

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
];

export default function GamesFinderList() {
  const { rows, selectedRows, searchGames } = useScanner();

  const selectedPrograms = useMemo(
    // TODO: fix types
    () => rows.filter(({ id }) => selectedRows.includes(id)),
    [rows, selectedRows]
  );

  useEffect(() => {
    searchGames();
  }, []);

  return (
    <Box sx={{ height: "50vh" }}>
      <DataGrid
        columns={columns}
        rows={selectedPrograms}
        // autoPageSize
        disableSelectionOnClick
        disableColumnMenu
        hideFooter
      />
    </Box>
  );
}
