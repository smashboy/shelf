import path from "path";
import fs from "fs/promises";
import { ipcMain, dialog } from "electron";
import { CancelablePromise, cancelable } from "cancelable-promise";
import PowerShell from "../windows/PowerShell";
import ConfigStore from "../store/ConfigStore";
import { ScannedModel } from "src/models/ScannedModel";
import { uninstallPatterns } from "../../utils/files";
import CacheStore from "../store/CacheStore";

interface GamesScannerProps {
  configStore: ConfigStore;
  cacheStore: CacheStore;
  shell: PowerShell;
}

export default class GamesScanner {
  private readonly configStore: ConfigStore;
  private readonly cacheStore: CacheStore;
  private readonly shell: PowerShell;

  constructor(props: GamesScannerProps) {
    this.configStore = props.configStore;
    this.cacheStore = props.cacheStore;
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
        const listPromise = cancelable(fs.readdir(directory, { withFileTypes: true }));
        promises.push(listPromise);
        const list = await listPromise;

        if (list.length === 0) return resolve(results);

        for (const file of list) {
          const fileName = path.normalize(`${directory}${path.sep}${file.name}`);

          try {
            if (file.isDirectory()) {
              const newFilesPromise = this._walkDirectory(fileName);
              promises.push(newFilesPromise);
              const newFiles = await newFilesPromise;
              results.push(...newFiles);

              continue;
            }

            if (file.isFile()) {
              const extension = path.extname(fileName);

              if (extension === ".exe") {
                const isUninstallFile = uninstallPatterns.some((item) =>
                  new RegExp(item, "i").test(fileName)
                );

                if (isUninstallFile) continue;

                const cachedData = await this.cacheStore.load("scanned", fileName);

                if (cachedData) {
                  const scannedData: ScannedModel = {
                    ...cachedData.data,
                    icon: cachedData.media[0] || null,
                  };
                  results.push(scannedData);
                  continue;
                }

                const infoPromise = this.shell.getFileInfo(fileName);
                promises.push(infoPromise);
                const info = await infoPromise;

                if (info) {
                  const newData2Cache = { executionPath: fileName, name: info.name };

                  results.push({ executionPath: fileName, ...info });

                  await this.cacheStore.save(
                    "scanned",
                    fileName,
                    newData2Cache,
                    info.icon ?? undefined
                  );
                }
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
