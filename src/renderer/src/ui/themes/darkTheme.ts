import { createTheme, responsiveFontSizes } from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00B2FF",
    },
    secondary: {
      main: "#ffffff",
    },
    background: {
      paper: "#000",
    },
  },
});

export default responsiveFontSizes(darkTheme);
