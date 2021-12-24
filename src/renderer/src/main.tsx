import { ThemeProvider } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import darkTheme from "./ui/themes/darkTheme";
import "./storage/ElectronStore";
import { ViewStoreProvider } from "./storage/ViewStore";

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <ViewStoreProvider>
        <App />
      </ViewStoreProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root"),
  () => {
    window.bridge.removeLoading();
  }
);

// -----------------------------------------------------------

console.log("contextBridge ->", window.bridge);

// Use ipcRenderer.on
window.bridge.ipcRenderer.on("main-process-message", (_event, ...args) => {
  console.log("[Receive Main-process message]:", ...args);
});
