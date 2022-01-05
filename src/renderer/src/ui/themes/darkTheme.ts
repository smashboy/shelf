import { createTheme, responsiveFontSizes } from "@mui/material";

const darkTheme = createTheme({
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
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
