import { ipcMain } from "electron";
import { CancelablePromise, cancelable } from "cancelable-promise";
import Shell from "node-powershell";
import electronLog from "electron-log";

export default class PowerShell {
  private readonly shell = new Shell({
    executionPolicy: "Bypass",
    noProfile: true,
  });

  private readonly log = electronLog.create("powershell");

  constructor() {
    this.log.transports.console.level = "error";
    this.log.transports.file.fileName = "powershell";

    this.initListeners();
  }

  initListeners() {
    ipcMain.handle("get-path-icon", async (_, path: string) => {
      const icon = await this.getFileIcon(path);
      return icon;
    });
  }

  async runCommands(...commands: string[]) {
    this.log.log(`Running commands ${commands.join(", ")}`);

    commands.forEach((command) => this.shell.addCommand(command));

    const response = await this.shell.invoke();

    return response;
  }

  getFileInfo(filePath: string) {
    return new CancelablePromise(async (resolve, _, onCancel) => {
      try {
        this.log.log(`Get file info ${filePath}`);

        let dataPromise: CancelablePromise | null = null;

        onCancel(() => {
          if (dataPromise) dataPromise.cancel();
          this.log.log(`Get file info cancel ${filePath}`);
        });

        dataPromise = cancelable(
          this.runCommands(`dir "${filePath}" | Select-Object VersionInfo | ConvertTo-JSON`)
        );
        const data = await dataPromise;

        if (!data) return resolve(null);

        const parsedData = JSON.parse(data);

        const name = (parsedData?.ProductName ||
          parsedData?.InternalName ||
          parsedData?.FileDescription ||
          null) as string | null;

        resolve({ name });
      } catch (error) {
        // @ts-ignore
        this.log.error(`Get file info error ${error?.message}`);
        // console.error("GET FILE ERROR:", error);
        resolve(null);
      }
    });
  }

  async getFileIcon(filePath: string) {
    return new CancelablePromise(async (resolve, _, onCancel) => {
      try {
        this.log.log(`Get file icon ${filePath}`);

        let dataPromise: CancelablePromise | null = null;

        onCancel(() => {
          if (dataPromise) dataPromise.cancel();
          this.log.log(`Get file icon cancel ${filePath}`);
        });

        dataPromise = cancelable(
          this.runCommands(
            "Add-Type -AssemblyName System.Drawing",
            `$Path = "${filePath}"`,
            "$Icon = [System.Drawing.Icon]::ExtractAssociatedIcon($Path)",
            "$MemoryStream = New-Object System.IO.MemoryStream",
            "$Icon.save($MemoryStream)",
            "$Bytes = $MemoryStream.ToArray()",
            "$MemoryStream.Flush()",
            "$MemoryStream.Dispose()",
            "[convert]::ToBase64String($Bytes)"
          )
        );
        let image = await dataPromise;

        if (!image) return resolve(null);

        image = image ? `data:image/png;base64,${image}` : null;

        resolve(image);
      } catch (error) {
        // @ts-ignore
        this.log.error(`Get file icon error ${error?.message}`);
        resolve(null);
      }
    });
  }
}
