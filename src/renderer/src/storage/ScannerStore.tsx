import { createContext, useCallback, useContext, useState } from "react";
import { ScannedModel } from "src/models/ScannedModel";

type ScannerStore = {
  isScanning: boolean;
  result: ScannedModel[];
  detect: () => Promise<void>;
  cancelDetect: () => Promise<void>;
  scan: () => Promise<void>;
  cancelScan: () => Promise<void>;
};

const ScannerStoreContext = createContext<ScannerStore | null>(null);

export const ScannerStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScannedModel[]>([]);

  const handleDetect = useCallback(async () => {
    try {
      const { invoke } = window.bridge.ipcRenderer;
      setIsScanning(true);

      const newData = await invoke("games-scanner");

      setIsScanning(false);

      if (!newData || newData?.length === 0) return;

      setResult(newData);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleCancelDetect = useCallback(async () => {
    try {
      const { send } = window.bridge.ipcRenderer;

      await send("cancel-games-scanner");

      setIsScanning(false);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleScan = useCallback(async () => {
    try {
      const { invoke } = window.bridge.ipcRenderer;
      setIsScanning(true);

      const newData = await invoke("direcotry-scanner");

      setIsScanning(false);

      if (!newData || newData?.length === 0) return;

      setResult(newData);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleCancelScan = useCallback(async () => {
    try {
      const { send } = window.bridge.ipcRenderer;

      await send("cancel-directory-scanner");

      setIsScanning(false);
    } catch (error) {
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
