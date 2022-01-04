import { useEffect, useMemo } from "react";
import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useScanner } from "@/storage/ScannerStore";
import LoadingOverlay from "./LoadingOverlay";
import { ProgramIcon } from "./ScannedProgramsList";
import GameSelector from "./GameSelector";

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
  {
    field: "selectedGame",
    headerName: "Selected Game",
    editable: false,
    sortable: false,
    flex: 1,
    renderCell: (params) => params.value?.name || "",
  },
  {
    field: "gamesFound",
    headerName: "Games Found",
    editable: false,
    sortable: false,
    flex: 0.25,
    renderCell: (params) => <GameSelector {...params.value} />,
  },
];

export default function GamesFinderList() {
  const { rows, searchGames, isLoading, games, selected } = useScanner();

  const selectedPrograms = useMemo(
    // TODO: fix types
    () =>
      Object.values(selected).map((row) => ({
        ...row,
        gamesFound: {
          programKey: row.executionPath,
          games: games[row.executionPath] || [],
          initialSelect: row.selectedGame,
        },
      })),
    [rows, selected, games]
  );

  useEffect(() => {
    searchGames();
  }, []);

  return (
    <Box sx={{ height: "50vh" }}>
      <DataGrid
        loading={isLoading}
        columns={columns}
        rows={selectedPrograms}
        components={{
          LoadingOverlay,
        }}
        // autoPageSize
        disableSelectionOnClick
        disableColumnMenu
        hideFooter
      />
    </Box>
  );
}
