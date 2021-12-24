import { ipcMain } from "electron";
import ElectronStore from "electron-store";

export default class Store {
  private readonly store = new ElectronStore();

  init() {
    ipcMain.handle("electron-store", async (_evnet, methodSign: string, ...args: any[]) => {
      if (typeof (this.store as any)[methodSign] === "function") {
        return (this.store as any)[methodSign](...args);
      }
      return (this.store as any)[methodSign];
    });
  }

  set(props: Record<string, any>) {
    this.store.set(props);
  }

  get<T>(...args: string[]): T {
    let value = this.store.get(args.join(".")) as string;

    try {
      value = JSON.parse(value);
    } finally {
      return value as any;
    }
  }
}
