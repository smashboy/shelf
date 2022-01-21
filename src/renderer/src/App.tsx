import { CssBaseline, GlobalStyles, useTheme, Container } from "@mui/material";
import { GamesListStoreProvider } from "./storage/GamesListStore";
import { GameStoreProvider } from "./storage/GameStore";
import Titlebar from "./ui/components/Titlebar";
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
          "html, body": {
            overflow: "hidden",
          },
          "::-webkit-scrollbar": {
            width: 6,
            height: 6,
          },
          "::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "::-webkit-scrollbar-thumb": {
            background: theme.palette.text.primary,
          },
        }}
      />
      <Titlebar />
      <Container
        disableGutters
        maxWidth="xl"
        sx={{
          overflow: "auto",
          // backgroundColor: "red",
          marginTop: 0.5,
          paddingBottom: 5,
          height: "calc(100vh - env(titlebar-area-height, var(--fallback-title-bar-height)))",
        }}
      >
        <LoadingView />
        <GamesListStoreProvider>
          <GameStoreProvider>
            <MainView />
            <GameView />
          </GameStoreProvider>
        </GamesListStoreProvider>
        <WelcomeView />
      </Container>
    </>
  );
}
