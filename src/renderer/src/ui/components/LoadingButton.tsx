import {
  LoadingButtonProps as MUILoadingButtonProps,
  LoadingButton as MUILoadingButton,
} from "@mui/lab";

interface ButtonProps
  extends Omit<
    MUILoadingButtonProps,
    "disableElevation" | "disableRipple" | "disableTouchRipple" | "disableFocusRipple"
  > {}

export default function LoadingButton({ children, ...props }: ButtonProps) {
  return (
    <MUILoadingButton
      disableElevation
      disableRipple
      disableTouchRipple
      disableFocusRipple
      {...props}
    >
      {children}
    </MUILoadingButton>
  );
}
