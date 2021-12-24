import { CancelablePromise, cancelable } from "cancelable-promise";
import Shell from "node-powershell";
import { ScannedModel } from "src/models/ScannedModel";

export default class PowerShell {
  private shell = new Shell({
    executionPolicy: "Bypass",
    noProfile: true,
  });

  constructor() {
    this.getFileInfo = this.getFileInfo.bind(this);
  }

  async runCommands(...commands: string[]) {
    commands.map((command) => this.shell.addCommand(command));
    const response = await this.shell.invoke();

    return response;
  }

  getFileInfo(filePath: string) {
    return new CancelablePromise(async (resolve, _, onCancel) => {
      try {
        let dataPromise: CancelablePromise | null = null;

        onCancel(() => {
          if (dataPromise) dataPromise.cancel();
        });

        this.shell.addCommand("Add-Type -AssemblyName System.Drawing");
        this.shell.addCommand(`$Path = "${filePath}"`);
        this.shell.addCommand("$Icon = [System.Drawing.Icon]::ExtractAssociatedIcon($Path)");
        this.shell.addCommand("$MemoryStream = New-Object System.IO.MemoryStream");
        this.shell.addCommand("$Icon.save($MemoryStream)");
        this.shell.addCommand("$Bytes = $MemoryStream.ToArray()");
        this.shell.addCommand("$MemoryStream.Flush()");
        this.shell.addCommand("$MemoryStream.Dispose()");
        this.shell.addCommand("$Image = [convert]::ToBase64String($Bytes)");

        this.shell.addCommand(`$VersionInfo = dir "${filePath}" | Select-Object VersionInfo`);
        this.shell.addCommand("$obj = New-Object -TypeName psobject");
        this.shell.addCommand(
          "$obj | Add-Member -MemberType NoteProperty -Name image -Value $Image"
        );
        this.shell.addCommand(
          "$obj | Add-Member -MemberType NoteProperty -Name versionInfo -Value $VersionInfo"
        );
        this.shell.addCommand("$obj | ConvertTo-JSON");

        dataPromise = cancelable(this.shell.invoke());
        const data = await dataPromise;

        if (!data) return resolve(null);

        const parsedData = JSON.parse(data);

        const image = parsedData?.image ? `data:image/webp;base64,${parsedData.image}` : null;

        const versionInfo = parsedData?.versionInfo?.VersionInfo;

        const name = (versionInfo?.ProductName ||
          versionInfo?.InternalName ||
          versionInfo?.FileDescription ||
          null) as string | null;

        resolve({ icon: image, name });
      } catch (error) {
        // console.error("GET FILE ERROR:", error);
        resolve(null);
      }
    });
  }
}
