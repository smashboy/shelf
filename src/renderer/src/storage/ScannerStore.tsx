import useNotifications from "@/hooks/useNotifications";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ScannedModel } from "src/models/ScannedModel";
import { GameBaseModel } from "src/models/GameModel";
import { useView, View } from "./ViewStore";

type ScannerStore = {
  open: boolean;
  view: ScannerView;
  isLoading: boolean;
  result: Record<string, ScannedModel>;
  selected: Record<string, ScannedModel & { selectedGame?: GameBaseModel }>;
  rows: ScannedModel[];
  filter: string;
  filteredRows: ScannedModel[];
  selectedRows: number[];
  games: Record<string, GameBaseModel[]>;
  setFilter: (newFilter: string) => void;
  searchGames: () => Promise<void>;
  selectModels: (selectedIndexes: number[]) => void;
  detect: () => Promise<void>;
  cancelDetect: () => Promise<void>;
  scan: () => Promise<void>;
  cancelScan: () => Promise<void>;
  scanFile: () => Promise<void>;
  setView: (view: ScannerView) => void;
  selectGame: (key: string, game: GameBaseModel) => void;
  close: () => void;
};

export enum ScannerView {
  PROGRAMS_SCANNER,
  GAMES_FINDER,
  FINISH_SCAN,
}

const ScannerStoreContext = createContext<ScannerStore | null>(null);

export const ScannerStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const { view: appView, setView: setAppView } = useView();
  const { notify } = useNotifications();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(ScannerView.PROGRAMS_SCANNER);
  const [isLoading, setIsLoading] = useState(false);

  const [result, setResult] = useState<Record<string, ScannedModel>>({});
  const [filter, setFilter] = useState("");
  const [selectedPrograms, setSelectedPrograms] = useState<
    Record<string, ScannedModel & { selectedGame?: GameBaseModel }>
  >({});
  const [games, setGames] = useState<Record<string, GameBaseModel[]>>({});

  useEffect(() => {
    if (appView === View.WELCOME) setOpen(true);
  }, [appView]);

  const rows = useMemo(
    () =>
      Object.values(result).map((program, index) => ({
        id: index,
        ...program,
      })),
    [result]
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const filterLC = filter.toLowerCase();
        return (
          row.name.toLowerCase().indexOf(filterLC) > -1 ||
          row.executionPath.toLowerCase().indexOf(filterLC) > -1
        );
      }),
    [rows, filter]
  );

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedPrograms[row.executionPath]).map(({ id }) => id),
    [rows, selectedPrograms]
  );

  const _addNewPrograms = useCallback(
    (programs: ScannedModel[]) => {
      if (programs.length === 0) return;

      let newProgramsCounter = 0;
      const newPrograms: Record<string, ScannedModel> = {};

      for (const program of programs) {
        if (!result[program.executionPath]) {
          newProgramsCounter++;
          newPrograms[program.executionPath] = program;
        }
      }

      notify(`Added ${newProgramsCounter} new programs!`);

      if (newProgramsCounter > 0) setResult((prevState) => ({ ...prevState, ...newPrograms }));
    },
    [result]
  );

  const handleDetect = useCallback(async () => {
    try {
      const { invoke } = window.bridge.ipcRenderer;
      setIsLoading(true);

      const newData = await invoke("programs-scanner");

      setIsLoading(false);

      if (!newData) return;

      _addNewPrograms(newData);
    } catch (error) {
      console.error(error);
    }
  }, [result]);

  const handleCancelDetect = useCallback(async () => {
    try {
      const { send } = window.bridge.ipcRenderer;

      await send("cancel-programs-scanner");

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  }, []);

  const handleScanFile = useCallback(async () => {
    const { invoke } = window.bridge.ipcRenderer;
    setIsLoading(true);

    const newData = await invoke("file-scanner");

    setIsLoading(false);

    if (!newData) return;

    _addNewPrograms([newData]);
  }, [result]);

  const handleScan = useCallback(async () => {
    try {
      const { invoke } = window.bridge.ipcRenderer;
      setIsLoading(true);

      const newData = await invoke("direcotry-scanner");

      setIsLoading(false);

      if (!newData) return;

      _addNewPrograms(newData);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  }, [result]);

  const handleCancelScan = useCallback(async () => {
    try {
      const { send } = window.bridge.ipcRenderer;

      await send("cancel-directory-scanner");

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  }, []);

  const handleSelectModels = useCallback(
    (selectedIndexes: number[]) => {
      console.log(selectedIndexes);
      const updatedSelection: Record<string, ScannedModel> = {};

      for (const index of selectedIndexes) {
        const program = rows[index];

        if (!program) continue;

        updatedSelection[program.executionPath] = program;
      }

      setSelectedPrograms(updatedSelection);
    },
    [rows]
  );

  const handleClose = () =>
    useCallback(() => {
      setAppView(View.MAIN);
      setOpen(false);
    }, []);

  const handleView = useCallback((view: ScannerView) => setView(view), []);

  const handleSearchGames = useCallback(async () => {
    try {
      const { invoke } = window.bridge.ipcRenderer;

      setIsLoading(true);

      const data = await invoke(
        "search-games",
        Object.values(selectedPrograms).map(({ name, executionPath, cachedGamesSearchSlugs }) => ({
          name,
          key: executionPath,
          cachedGamesSearchSlugs,
        }))
      );

      setGames(data);

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  }, [selectedPrograms]);

  const handleSelectGame = useCallback(
    (key: string, game: GameBaseModel) =>
      setSelectedPrograms((prevState) => ({
        ...prevState,
        [key]: { ...prevState[key], selectedGame: game },
      })),
    []
  );

  const handleSetFilter = useCallback((newFilter: string) => setFilter(newFilter), []);

  return (
    <ScannerStoreContext.Provider
      value={{
        open,
        view,
        isLoading,
        result,
        rows,
        filteredRows,
        selectedRows,
        games,
        filter,
        selected: selectedPrograms,
        setFilter: handleSetFilter,
        selectGame: handleSelectGame,
        searchGames: handleSearchGames,
        detect: handleDetect,
        cancelDetect: handleCancelDetect,
        cancelScan: handleCancelScan,
        scan: handleScan,
        scanFile: handleScanFile,
        selectModels: handleSelectModels,
        setView: handleView,
        close: handleClose,
      }}
    >
      {children}
    </ScannerStoreContext.Provider>
  );
};

export const useScanner = () => {
  const store = useContext(ScannerStoreContext);

  if (!store) throw new Error("useScanner must be used within ");

  return store;
};
