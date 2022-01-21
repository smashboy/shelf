import { styled } from "@mui/material";
import {
  LoadingButtonProps as MUILoadingButtonProps,
  LoadingButton as MUILoadingButton,
} from "@mui/lab";

const StyledLoadingButton = styled(MUILoadingButton)(() => ({
  borderRadius: 3,
}));

interface ButtonProps
  extends Omit<
    MUILoadingButtonProps,
    "disableElevation" | "disableRipple" | "disableTouchRipple" | "disableFocusRipple"
  > {}

export default function LoadingButton({ children, ...props }: ButtonProps) {
  return (
    <StyledLoadingButton
      disableElevation
      disableRipple
      disableTouchRipple
      disableFocusRipple
      {...props}
    >
      {children}
    </StyledLoadingButton>
  );
}
