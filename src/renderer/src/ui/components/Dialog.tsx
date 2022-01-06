import { Dialog as MUIDialog, DialogProps as MUIDialogProps } from "@mui/material";

interface DialogProps extends MUIDialogProps {}

export default function Dialog(props: DialogProps) {
  const { sx, children, ...otherProps } = props;

  return (
    <MUIDialog
      sx={{
        ...sx,
        "& .MuiDialog-paper": {
          // @ts-ignore
          ...sx["& .MuiDialog-paper"],
          backgroundImage: "none",
        },
      }}
      {...otherProps}
    >
      {children}
    </MUIDialog>
  );
}
