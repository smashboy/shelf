// Use 'electron-store'
const electronStore = {
  async get<T>(key: string): Promise<T | null | undefined> {
    const { invoke } = window.bridge.ipcRenderer;
    let value = await invoke("electron-store", "get", key);
    try {
      value = JSON.parse(value);
    } finally {
      return value;
    }
  },
  async set(key: string, value: any) {
    const { invoke } = window.bridge.ipcRenderer;
    let val = value;
    try {
      if (value && typeof value === "object") {
        val = JSON.stringify(value);
      }
    } finally {
      await invoke("electron-store", "set", key, val);
    }
  },
};

(async () => {
  await electronStore.set("Date.now", Date.now());
  console.log("electron-store ->", "Date.now:", await electronStore.get("Date.now"));
  console.log(
    "electron-store ->",
    "path:",
    await window.bridge.ipcRenderer.invoke("electron-store", "path")
  );
})();

export default electronStore;
