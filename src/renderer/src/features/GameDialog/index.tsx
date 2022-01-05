import { useGame } from "@/storage/GameStore";
import { Dialog, DialogTitle, Grow } from "@mui/material";
import CloseButton from "./CloseButton";
import Header from "./Header";

export default function GameDialog() {
  const { game } = useGame();

  return (
    <Dialog
      TransitionComponent={Grow}
      open={Boolean(game)}
      sx={{
        "& .MuiDialog-paper": {
          position: "relative",
        },
      }}
      fullScreen
    >
      <DialogTitle
        sx={{ position: "absolute", color: (theme) => theme.palette.text.primary, zIndex: 1 }}
      >
        {game?.name}
      </DialogTitle>
      <CloseButton />
      <Header />
    </Dialog>
  );
}
