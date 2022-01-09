import { Grid } from "@mui/material";
import {
  MdPlayArrow as PlayIcon,
  // MdDelete as DeleteIcon,
  MdBookmarkAdd as BookmarkAddIcon,
  MdDownload as DownloadIcon,
} from "react-icons/md";
import Button from "@/ui/components/Button";
import { useGame } from "@/storage/GameStore";
import LoadingButton from "@/ui/components/LoadingButton";
import { useGamesList } from "@/storage/GamesListStore";
import { useMemo } from "react";

export default function GameActions() {
  const { launchedGames } = useGamesList();

  const { game, launchGame, isLoadingGame } = useGame();

  const isGameLaunched = useMemo(
    () => (game?.relatedExecution ? launchedGames.includes(game.relatedExecution) : false),
    [launchedGames, game]
  );

  return (
    <Grid container spacing={1} sx={{ width: "auto" }}>
      {game?.relatedExecution ? (
        <>
          <Grid container item xs="auto" alignItems="center">
            <LoadingButton
              onClick={launchGame}
              disabled={isGameLaunched}
              variant="contained"
              loading={isLoadingGame}
              startIcon={<PlayIcon />}
            >
              {isGameLaunched ? "Playing..." : "Play"}
            </LoadingButton>
          </Grid>
          {/* <Grid container item xs="auto" alignItems="center">
            <Button variant="contained" color="error" startIcon={<DeleteIcon />}>
              Delete
            </Button>
          </Grid> */}
        </>
      ) : (
        <Grid container item xs="auto" alignItems="center">
          <Button variant="contained" startIcon={<DownloadIcon />}>
            Install
          </Button>
        </Grid>
      )}
      <Grid container item xs="auto" alignItems="center">
        <Button variant="outlined" color="secondary" sx={{ height: "36px" }}>
          <BookmarkAddIcon size={20} />
        </Button>
      </Grid>
    </Grid>
  );
}
