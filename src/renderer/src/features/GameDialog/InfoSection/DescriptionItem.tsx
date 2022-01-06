import { Typography } from "@mui/material";

export interface DescriptionItemProps {
  title: string;
  description: string;
}

export default function DescriptionItem(props: DescriptionItemProps) {
  const { title, description } = props;

  return (
    <Typography
      variant="subtitle2"
      component="div"
      color="text.secondary"
      sx={{ display: "flex", justifyContent: "space-between" }}
    >
      <b>{title}</b>
      <Typography variant="subtitle2" component="span" color="text.primary" sx={{ paddingLeft: 2 }}>
        {description}
      </Typography>
    </Typography>
  );
}
