import path from "path";
import fs from "fs/promises";
import { ipcMain, dialog } from "electron";
import { CancelablePromise, cancelable } from "cancelable-promise";
import PowerShell from "../windows/PowerShell";
import { ScannedModel } from "src/models/ScannedModel";
import { isValidExeFile } from "../../utils/files";
import CacheStore from "../store/CacheStore";

interface GamesScannerProps {
  cacheStore: CacheStore;
  shell: PowerShell;
}

export default class GamesScanner {
  private readonly cacheStore: CacheStore;
  private readonly shell: PowerShell;

  private readonly _maxWalkDepth = 7;

  constructor(props: GamesScannerProps) {
    this.cacheStore = props.cacheStore;
    this.shell = props.shell;

    this.initListeners = this.initListeners.bind(this);
  }

  initListeners() {
    let scanProgramsPromise: CancelablePromise | null = null;
    let scanDirectoryPromise: CancelablePromise | null = null;

    ipcMain.handle("programs-scanner", async () => {
      const promise = this.scanPrograms();

      scanProgramsPromise = promise;

      const programs = await promise;

      return programs;
    });

    ipcMain.handle("file-scanner", async () => {
      const program = await this.scanFile();

      return program;
    });

    ipcMain.handle("direcotry-scanner", async () => {
      const promise = this.scanDirectory();

      scanDirectoryPromise = promise;

      const filesList = await promise;

      return filesList;
    });

    ipcMain.on("cancel-programs-scanner", () => {
      if (scanProgramsPromise) scanProgramsPromise.cancel();
    });

    ipcMain.on("cancel-directory-scanner", () => {
      if (scanDirectoryPromise) scanDirectoryPromise.cancel();
    });
  }

  private scanPrograms() {
    return new CancelablePromise(async (resolve, _, onCancel) => {
      try {
        const result = await this.shell.runCommands(
          `Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object | ConvertTo-JSON`
        );

        const data = JSON.parse(result);

        const programs: ScannedModel[] = [];

        for (const item of data) {
          if (item?.DisplayName && item?.DisplayIcon) {
            const name = item.DisplayName;
            const executionPath = path.normalize(item.DisplayIcon);

            if (isValidExeFile(executionPath)) {
              try {
                const icon = await this.shell.getFileIcon(executionPath);
                const program: ScannedModel = {
                  name,
                  executionPath,
                  icon,
                };

                programs.push(program);
              } catch (error) {
                continue;
              }
            }
          }
        }

        resolve(programs);
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

  private async scanFile() {
    const response = await dialog.showOpenDialog({
      title: "Select file...",
      buttonLabel: "Select",
      properties: ["openFile", "dontAddToRecent"],
      filters: [{ name: "Execution file", extensions: ["exe"] }],
    });

    if (response.canceled) return;

    const filePath = response.filePaths[0];

    if (!filePath) return;

    const fileInfo = await this.shell.getFileInfo(filePath);

    if (fileInfo) {
      const name = fileInfo.name || path.basename(filePath).replace(path.extname(filePath), "");

      const model: ScannedModel = {
        name,
        icon: fileInfo.icon,
        executionPath: filePath,
      };

      return model;
    }
  }

  private _walkDirectory(directory: string, currentDepth: number = 0) {
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

        for (const dirent of list) {
          const filePath = path.normalize(`${directory}${path.sep}${dirent.name}`);

          try {
            if (dirent.isDirectory() && currentDepth < this._maxWalkDepth) {
              const newFilesPromise = this._walkDirectory(filePath, currentDepth + 1);
              promises.push(newFilesPromise);
              const newFiles = await newFilesPromise;
              results.push(...newFiles);

              continue;
            }

            if (dirent.isFile() && isValidExeFile(filePath)) {
              const cachedData = await this.cacheStore.load("execution-files", filePath);

              if (cachedData) {
                const scannedData: ScannedModel = {
                  ...cachedData.data,
                  icon: cachedData.media[0] || null,
                };
                results.push(scannedData);
                continue;
              }

              const infoPromise = this.shell.getFileInfo(filePath);
              promises.push(infoPromise);
              const info = await infoPromise;

              if (info) {
                const name =
                  info.name || path.basename(filePath).replace(path.extname(filePath), "");
                const newData2Cache = { executionPath: filePath, name };

                results.push({ executionPath: filePath, name, icon: info.icon });

                await this.cacheStore.save(
                  "execution-files",
                  filePath,
                  newData2Cache,
                  info.icon ?? undefined
                );
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
