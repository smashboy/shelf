import useNotifications from "@/hooks/useNotifications";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ScannedModel } from "src/models/ScannedModel";
import { useView, View } from "./ViewStore";

type ScannerStore = {
  open: boolean;
  view: ScannerView;
  isScanning: boolean;
  result: Record<string, ScannedModel>;
  selected: Record<string, ScannedModel>;
  rows: ScannedModel[];
  selectedRows: number[];
  searchGames: () => Promise<void>;
  selectModels: (selectedIndexes: number[]) => void;
  detect: () => Promise<void>;
  cancelDetect: () => Promise<void>;
  scan: () => Promise<void>;
  cancelScan: () => Promise<void>;
  scanFile: () => Promise<void>;
  setView: (view: ScannerView) => void;
  close: () => void;
};

export enum ScannerView {
  PROGRAMS_SCANNER,
  GAMES_FINDER,
}

export const scannerSteps = [ScannerView.PROGRAMS_SCANNER, ScannerView.GAMES_FINDER];

const ScannerStoreContext = createContext<ScannerStore | null>(null);

export const ScannerStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const { view: appView, setView: setAppView } = useView();
  const { notify } = useNotifications();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState(ScannerView.PROGRAMS_SCANNER);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<Record<string, ScannedModel>>({});
  const [selectedModels, setSelectedModels] = useState<Record<string, ScannedModel>>({});

  useEffect(() => {
    if (appView === View.WELCOME) setOpen(true);
  }, [appView]);

  const rows = useMemo(
    () =>
      Object.values(result).map(({ icon, name, executionPath }, index) => ({
        id: index,
        icon,
        name,
        executionPath,
      })),
    [result]
  );

  const selectedRows = useMemo(
    () => rows.filter((row) => selectedModels[row.executionPath]).map(({ id }) => id),
    [rows, selectedModels]
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
      setIsScanning(true);

      const newData = await invoke("programs-scanner");

      setIsScanning(false);

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

      setIsScanning(false);
    } catch (error) {
      setIsScanning(false);
      console.error(error);
    }
  }, []);

  const handleScanFile = useCallback(async () => {
    const { invoke } = window.bridge.ipcRenderer;
    setIsScanning(true);

    const newData = await invoke("file-scanner");

    setIsScanning(false);

    if (!newData) return;

    _addNewPrograms([newData]);
  }, [result]);

  const handleScan = useCallback(async () => {
    try {
      const { invoke } = window.bridge.ipcRenderer;
      setIsScanning(true);

      const newData = await invoke("direcotry-scanner");

      setIsScanning(false);

      if (!newData) return;

      _addNewPrograms(newData);
    } catch (error) {
      setIsScanning(false);
      console.error(error);
    }
  }, [result]);

  const handleCancelScan = useCallback(async () => {
    try {
      const { send } = window.bridge.ipcRenderer;

      await send("cancel-directory-scanner");

      setIsScanning(false);
    } catch (error) {
      setIsScanning(false);
      console.error(error);
    }
  }, []);

  const handleSelectModels = useCallback(
    (selectedIndexes: number[]) => {
      const updatedSelection: Record<string, ScannedModel> = {};

      for (const index of selectedIndexes) {
        const program = rows[index];

        if (!program) continue;

        updatedSelection[program.executionPath] = program;
      }

      setSelectedModels(updatedSelection);
    },
    [selectedModels, rows]
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

      await invoke(
        "search-games",
        Object.values(selectedModels).map(({ name }) => name)
      );
    } catch (error) {
      console.error(error);
    }
  }, [selectedModels]);

  return (
    <ScannerStoreContext.Provider
      value={{
        open,
        view,
        isScanning,
        result,
        rows,
        selectedRows,
        selected: selectedModels,
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
