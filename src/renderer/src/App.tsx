import { Container, CssBaseline } from "@mui/material";
import LoadingView from "./views/LoadingView";
import WelcomeView from "./views/WelcomeView";

export default function App() {
  return (
    <>
      <CssBaseline />
      <Container></Container>
      <LoadingView />
      <WelcomeView />
    </>
  );
}
