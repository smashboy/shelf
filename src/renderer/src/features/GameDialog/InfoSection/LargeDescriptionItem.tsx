import { Paper, Typography } from "@mui/material";
import { DescriptionItemProps } from "./DescriptionItem";

export default function LargeDescriptionItem(props: DescriptionItemProps) {
  const { title, description } = props;

  return (
    <>
      <Typography variant="h5" color="primary">
        {title}
      </Typography>
      <Paper sx={{ padding: 2 }} elevation={0}>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Paper>
    </>
  );
}
