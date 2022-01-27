import os from "os";
import { join } from "path";
import { app, BrowserWindow, shell as electronShell } from "electron";
import ConfigStore from "./services/store/ConfigStore";
import GamesScanner from "./services/games/Scanner";
import PowerShell from "./services/windows/PowerShell";
import CacheStore from "./services/store/CacheStore";
import IGDBClient from "./services/games/IGDBClient";
import GamesManager from "./services/games/Manager";

const isWin7 = os.release().startsWith("6.1");
if (isWin7) app.disableHardwareAcceleration();

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

new ConfigStore();
const cacheStore = new CacheStore();
const shell = new PowerShell();
const igdb = new IGDBClient(cacheStore);

new GamesScanner({
  cacheStore,
  shell,
  igdb,
});

let win: BrowserWindow | null = null;

async function mainWin() {
  win = new BrowserWindow({
    title: "Shelf",
    autoHideMenuBar: true,
    minWidth: 1280,
    minHeight: 600,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#0d0d0d",
      symbolColor: "#ffffff",
    },
    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
    },
  });

  if (app.isPackaged) {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  } else {
    const pkg = await import("../../package.json");
    const url = `http://${pkg.env.HOST || "127.0.0.1"}:${pkg.env.PORT}`;

    win.loadURL(url);
    win.maximize();
    win.webContents.openDevTools();
  }

  new GamesManager({
    cacheStore,
    igdb,
    appWindow: win,
  });

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  win.webContents.setWindowOpenHandler((options) => {
    electronShell.openExternal(options.url);

    return { action: "deny" };
  });
}

app.whenReady().then(mainWin);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("second-instance", () => {
  if (win) {
    // Someone tried to run a second instance, we should focus our window.
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
