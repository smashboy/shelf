import { ButtonProps as MUIButtonProps, Button as MUIButton, styled } from "@mui/material";

const ButtonStyled = styled(MUIButton)(() => ({
  borderRadius: 3,
}));

interface ButtonProps
  extends Omit<
    MUIButtonProps,
    "disableElevation" | "disableRipple" | "disableTouchRipple" | "disableFocusRipple"
  > {}

export default function Button({ children, ...props }: ButtonProps) {
  return (
    <ButtonStyled disableElevation disableRipple disableTouchRipple disableFocusRipple {...props}>
      {children}
    </ButtonStyled>
  );
}
