import { IconButtonProps as MUIIconButtonProps, IconButton as MUIIconButton } from "@mui/material";

interface IconButtonProps
  extends Omit<
    MUIIconButtonProps,
    "disableElevation" | "disableRipple" | "disableTouchRipple" | "disableFocusRipple"
  > {}

export default function IconButton({ children, ...props }: IconButtonProps) {
  return (
    <MUIIconButton disableFocusRipple disableRipple disableTouchRipple {...props}>
      {children}
    </MUIIconButton>
  );
}
