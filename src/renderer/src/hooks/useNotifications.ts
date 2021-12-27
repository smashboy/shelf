import { useSnackbar, OptionsObject } from "notistack";

const useNotifications = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const notify = (message: React.ReactNode, options?: OptionsObject) =>
    enqueueSnackbar(message, options);

  return {
    notify,
    closeNotification: closeSnackbar,
  };
};

export default useNotifications;
