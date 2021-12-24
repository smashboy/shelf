import { createContext, useCallback, useContext, useState } from "react";

type ScannerStore = {
  isScanning: boolean;
  result: any;
  scan: () => Promise<void>;
  cancel: () => void;
};

const ScannerStoreContext = createContext<ScannerStore | null>(null);

export const ScannerStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState([]);

  const handleScan = useCallback(async () => {
    try {
      const { invoke } = window.bridge.ipcRenderer;
      setIsScanning(true);

      const result = await invoke("direcotry-scanner");

      setIsScanning(false);

      console.log(result);
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
        cancel: handleCancelScan,
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
