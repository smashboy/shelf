import { Grid, Box, DialogTitle } from "@mui/material";
import {
  MdPlayArrow as PlayIcon,
  MdDelete as DeleteIcon,
  MdBookmarkAdd as BookmarkAddIcon,
} from "react-icons/md";
import { useGame } from "@/storage/GameStore";
import Button from "@/ui/components/Button";
import GamePoster from "./GamePoster";

export default function Header() {
  const { headerImage, game } = useGame();

  return (
    <Box
      sx={{
        width: "100%",
        height: 350,
        backgroundColor: (theme) => theme.palette.background.paper,
        backgroundImage: headerImage ? `url(${headerImage})` : undefined,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        position: "relative",
      }}
    >
      <DialogTitle
        sx={{
          color: (theme) => theme.palette.text.primary,
          position: "absolute",
          zIndex: 1,
        }}
      >
        {game?.name}
      </DialogTitle>
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.background.paper,
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0.15,
          width: "100%",
          height: "100%",
        }}
      />
      <Grid
        container
        spacing={2}
        sx={{ position: "absolute", bottom: -25, left: 50, maxWidth: "calc(100% - 100px)" }}
      >
        <Grid container item xs={2} justifyContent="center">
          <GamePoster />
        </Grid>
        <Grid container spacing={1} item xs={8} sx={{ marginBottom: 7, marginTop: 3 }}>
          <Grid container item xs="auto" alignItems="center">
            <Button variant="contained" startIcon={<PlayIcon />}>
              Play
            </Button>
          </Grid>

          <Grid container item xs="auto" alignItems="center">
            <Button variant="contained" color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          </Grid>
          <Grid container item xs="auto" alignItems="center">
            <Button variant="outlined" color="secondary" sx={{ height: "36px" }}>
              <BookmarkAddIcon size={20} />
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
