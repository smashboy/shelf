import path from "path";
import fs from "fs/promises";
import { ipcMain, dialog } from "electron";
import { CancelablePromise, cancelable } from "cancelable-promise";
import PowerShell from "../windows/PowerShell";
import Store from "../Store";
import { ScannedModel } from "src/models/ScannedModel";
import { uninstallPatterns } from "../../utils/files";

interface GamesScannerProps {
  store: Store;
  shell: PowerShell;
}

export default class GamesScanner {
  private store: Store;
  private shell: PowerShell;

  constructor(props: GamesScannerProps) {
    this.store = props.store;
    this.shell = props.shell;

    this.initListeners = this.initListeners.bind(this);
  }

  initListeners() {
    let scanProgramsPromise: CancelablePromise | null = null;
    let scanDirectoryPromise: CancelablePromise | null = null;

    ipcMain.handle("games-scanner", async () => {
      const promise = this.scanPrograms();

      scanProgramsPromise = promise;

      const programs = await promise;

      return programs;
    });

    ipcMain.handle("direcotry-scanner", async () => {
      const promise = this.scanDirectory();

      scanDirectoryPromise = promise;

      const filesList = await promise;

      return filesList;
    });

    ipcMain.on("cancel-games-scanner", () => {
      if (scanProgramsPromise) scanProgramsPromise.cancel();
    });

    ipcMain.on("cancel-directory-scanner", () => {
      if (scanDirectoryPromise) scanDirectoryPromise.cancel();
    });
  }

  private scanPrograms() {
    return new CancelablePromise(async (resolve) => {
      try {
        const result = await this.shell.runCommands(
          `Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object | ConvertTo-JSON`
        );

        resolve(JSON.parse(result));
      } catch (error) {
        // console.error("SCAN PROGRAMS ERROR", error);
      }
    });
  }

  private scanDirectory() {
    return new CancelablePromise(async (resolve, _, onCancel) => {
      try {
        let listPromise: CancelablePromise | null = null;

        onCancel(() => {
          if (listPromise) listPromise.cancel();
        });

        const response = await dialog.showOpenDialog({
          title: "Select folder...",
          buttonLabel: "Scan",
          properties: ["openDirectory", "dontAddToRecent"],
        });

        if (response.canceled) return resolve(undefined);

        const directory = response.filePaths[0];

        if (!directory) return resolve(undefined);

        listPromise = this._walkDirectory(directory);

        const list = await listPromise;

        resolve(list);
      } catch (error) {
        // console.error("SCAN DIRECTORY ERROR", error);
      }
    });
  }

  private _walkDirectory(directory: string) {
    return new CancelablePromise(async (resolve, _, onCancel) => {
      const results: ScannedModel[] = [];

      const promises: CancelablePromise[] = [];

      onCancel(() => {
        if (promises.length > 0) promises.map((promise) => promise.cancel());
      });

      try {
        const listPromise = cancelable(fs.readdir(directory));
        promises.push(listPromise);
        const list = await listPromise;

        if (list.length === 0) return resolve(results);

        for (let file of list) {
          file = path.resolve(directory, file);

          try {
            const statPromise = cancelable(fs.stat(file));
            promises.push(statPromise);
            const stat = await statPromise;

            if (stat && stat.isDirectory()) {
              const newFilesPromise = this._walkDirectory(file);
              promises.push(newFilesPromise);
              const newFiles = await newFilesPromise;

              results.push(...newFiles);

              continue;
            }

            if (stat && stat.isFile()) {
              const extension = path.extname(file);

              if (extension === ".exe") {
                const isUninstallFile = uninstallPatterns.some((item) =>
                  new RegExp(item, "i").test(file)
                );

                if (isUninstallFile) continue;

                const infoPromise = this.shell.getFileInfo(file);
                promises.push(infoPromise);
                const info = await infoPromise;

                if (info) {
                  results.push({ executionPath: file, ...info });
                  continue;
                }
                results.push({ executionPath: file, icon: null, name: null });
              }
            }
          } catch (error) {
            // console.error(error);
            continue;
          }
        }

        resolve(results);
      } catch (error) {
        // console.error("WALK DIRECTORY ERROR", error);
        resolve(results);
      }
    });
  }
}
