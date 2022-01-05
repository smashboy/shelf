import { CssBaseline, GlobalStyles, useTheme } from "@mui/material";
import { GameStoreProvider } from "./storage/GameStore";
import GameView from "./views/GameView";
import LoadingView from "./views/LoadingView";
import MainView from "./views/MainView";
import WelcomeView from "./views/WelcomeView";

export default function App() {
  const theme = useTheme();

  return (
    <>
      <CssBaseline />
      <GlobalStyles
        styles={{
          "::-webkit-scrollbar": {
            width: 10,
            height: 10,
          },

          "::-webkit-scrollbar-track": {
            backgroundColor: theme.palette.text.secondary,
          },

          "::-webkit-scrollbar-thumb": {
            background: theme.palette.text.primary,
          },
        }}
      />
      <LoadingView />
      <GameStoreProvider>
        <MainView />
        <GameView />
      </GameStoreProvider>
      <WelcomeView />
    </>
  );
}
