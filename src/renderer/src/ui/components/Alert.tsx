import {
  Alert as MUIAlert,
  AlertProps as MUIAlertProps,
  Collapse,
  IconButton,
} from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";

interface AlertProps extends MUIAlertProps {
  show?: boolean;
  onClose?: () => void;
  closable?: boolean;
  children?: React.ReactNode;
}

interface AlertActionProps {
  onClose?: () => void;
  closable?: boolean;
  action?: React.ReactNode;
}

function AlertAction({ closable, onClose, action }: AlertActionProps) {
  return closable ? (
    <IconButton aria-label="close" color="secondary" size="small" onClick={onClose}>
      {/* <CloseIcon fontSize="inherit" /> */}
    </IconButton>
  ) : action ? (
    () => action
  ) : null;
}

export default function Alert({
  children,
  show,
  onClose,
  closable,
  action,
  ...otherProps
}: AlertProps) {
  return (
    <Collapse in={show || true} unmountOnExit>
      <MUIAlert
        // @ts-ignore
        action={<AlertAction closable={closable} action={action} onClose={onClose} />}
        sx={{
          "& .icon": {
            alignItems: "center",
          },
        }}
        {...otherProps}
      >
        {children}
      </MUIAlert>
    </Collapse>
  );
}
