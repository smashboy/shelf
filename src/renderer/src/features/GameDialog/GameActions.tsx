import { Grid } from "@mui/material";
import {
  MdPlayArrow as PlayIcon,
  MdDelete as DeleteIcon,
  MdBookmarkAdd as BookmarkAddIcon,
} from "react-icons/md";
import Button from "@/ui/components/Button";

export default function GameActions() {
  return (
    <Grid container spacing={1} sx={{ width: "auto" }}>
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
  );
}
