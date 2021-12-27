import { createContext, useCallback, useContext, useState } from "react";
import { ScannedModel } from "src/models/ScannedModel";

type ScannerStore = {
  isScanning: boolean;
  result: Record<string, ScannedModel>;
  detect: () => Promise<void>;
  cancelDetect: () => Promise<void>;
  scan: () => Promise<void>;
  cancelScan: () => Promise<void>;
  scanFile: () => Promise<void>;
};

const ScannerStoreContext = createContext<ScannerStore | null>(null);

export const ScannerStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<Record<string, ScannedModel>>({});

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

      setResult((prevState) => ({ ...prevState, ...newPrograms }));
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
  }, []);

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
  }, []);

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
  }, []);

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

  return (
    <ScannerStoreContext.Provider
      value={{
        isScanning,
        result,
        detect: handleDetect,
        cancelDetect: handleCancelDetect,
        cancelScan: handleCancelScan,
        scan: handleScan,
        scanFile: handleScanFile,
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
