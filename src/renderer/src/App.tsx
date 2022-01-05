import { CssBaseline } from "@mui/material";
import { GameStoreProvider } from "./storage/GameStore";
import GameView from "./views/GameView";
import LoadingView from "./views/LoadingView";
import MainView from "./views/MainView";
import WelcomeView from "./views/WelcomeView";

export default function App() {
  return (
    <>
      <CssBaseline />
      <LoadingView />
      <GameStoreProvider>
        <MainView />
        <GameView />
      </GameStoreProvider>
      <WelcomeView />
    </>
  );
}
