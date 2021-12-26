import path from "path";

export const uninstallPatterns = ["uninst", "setup", "unins\\d+"];

export const isValidExeFile = (filePath: string) => {
  const extension = path.extname(filePath);

  return (
    extension === ".exe" &&
    !uninstallPatterns.some((item) => new RegExp(item, "i").test(filePath) || false)
  );
};
