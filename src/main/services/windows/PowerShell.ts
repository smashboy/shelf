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
          this.runCommands(
            "Add-Type -AssemblyName System.Drawing",
            `$Path = "${filePath}"`,
            "$Icon = [System.Drawing.Icon]::ExtractAssociatedIcon($Path)",
            "$MemoryStream = New-Object System.IO.MemoryStream",
            "$Icon.save($MemoryStream)",
            "$Bytes = $MemoryStream.ToArray()",
            "$MemoryStream.Flush()",
            "$MemoryStream.Dispose()",
            "$Image = [convert]::ToBase64String($Bytes)",
            `$VersionInfo = dir "${filePath}" | Select-Object VersionInfo`,
            "$obj = New-Object -TypeName psobject",
            "$obj | Add-Member -MemberType NoteProperty -Name image -Value $Image",
            "$obj | Add-Member -MemberType NoteProperty -Name versionInfo -Value $VersionInfo",
            "$obj | ConvertTo-JSON"
          )
        );
        const data = await dataPromise;

        if (!data) return resolve(null);

        const parsedData = JSON.parse(data);

        const image = parsedData?.image ? `data:image/png;base64,${parsedData.image}` : null;

        const versionInfo = parsedData?.versionInfo?.VersionInfo;

        const name = (versionInfo?.ProductName ||
          versionInfo?.InternalName ||
          versionInfo?.FileDescription ||
          null) as string | null;

        resolve({ icon: image, name });
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
