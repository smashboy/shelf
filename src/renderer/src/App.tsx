import { CssBaseline } from "@mui/material";
import GameView from "./views/GameView";
import LoadingView from "./views/LoadingView";
import MainView from "./views/MainView";
import WelcomeView from "./views/WelcomeView";

export default function App() {
  return (
    <>
      <CssBaseline />
      <LoadingView />
      <MainView />
      <GameView />
      <WelcomeView />
    </>
  );
}
