import { CancelablePromise, cancelable } from "cancelable-promise";
import Shell from "node-powershell";
import { ScannedModel } from "src/models/ScannedModel";

export default class PowerShell {
  private shell = new Shell({
    executionPolicy: "Bypass",
    noProfile: true,
  });

  async runCommands(...commands: string[]) {
    commands.forEach((command) => this.shell.addCommand(command));

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
        // console.error("GET FILE ERROR:", error);
        resolve(null);
      }
    });
  }
}
