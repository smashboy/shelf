import GamesList from "@/features/GamesList";
import { Container } from "@mui/material";

export default function MainView() {
  return (
    <Container sx={{ paddingTop: 10 }}>
      <GamesList />
    </Container>
  );
}
