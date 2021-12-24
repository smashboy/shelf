import { ButtonProps as MUIButtonProps, Button as MUIButton } from "@mui/material";

interface ButtonProps
  extends Omit<
    MUIButtonProps,
    "disableElevation" | "disableRipple" | "disableTouchRipple" | "disableFocusRipple"
  > {}

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <MUIButton disableElevation disableRipple disableTouchRipple disableFocusRipple {...props}>
      {children}
    </MUIButton>
  );
}
