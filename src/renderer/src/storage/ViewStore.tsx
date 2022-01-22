import { IS_NEW_USER_STORAGE_KEY } from "@/config";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import electronStore from "./ElectronStore";

export enum View {
  WELCOME = "WELCOME",
  MAIN = "MAIN",
  LOADING = "LOADING",
  SETTINGS = "SETTINGS",
  SELECTED_GAME = "SELECTED_GAME",
}

type ViewStore = {
  view: View;
  setView: (newView: View) => void;
  selectedGameId: string | null;
};

const ViewStoreContext = createContext<ViewStore | null>(null);

export const ViewStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [view, setView] = useState(View.LOADING);

  const handleSetView = useCallback((newView: View) => setView(newView), []);

  useEffect(() => {
    async function isNewUser() {
      try {
        const isNew = await electronStore.get<Boolean>(IS_NEW_USER_STORAGE_KEY);

        if (isNew === false) return setView(View.MAIN);

        setView(View.WELCOME);

        await electronStore.set(IS_NEW_USER_STORAGE_KEY, false);
      } catch (error) {
        console.error(error);
      }
    }

    isNewUser();
  }, []);

  return (
    <ViewStoreContext.Provider
      value={{
        view,
        setView: handleSetView,
        selectedGameId: null,
      }}
    >
      {children}
    </ViewStoreContext.Provider>
  );
};

export const useView = () => {
  const store = useContext(ViewStoreContext);

  return store!;
};
