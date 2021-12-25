import { ipcMain } from "electron";
import ElectronStore from "electron-store";

export interface BaseStoreProps {
  name?: string;
  initListeners?: boolean;
}

export default class BaseStore {
  private readonly store: ElectronStore;
  private readonly name: string | undefined;

  constructor(props?: BaseStoreProps) {
    const name = props?.name;
    const initListeners = props?.initListeners;

    this.name = name;

    this.store = new ElectronStore({
      name,
    });

    if (initListeners) this.init();
  }

  private init() {
    ipcMain.handle(this.eventKey, async (_evnet, methodSign: string, ...args: any[]) => {
      if (typeof (this.store as any)[methodSign] === "function") {
        return (this.store as any)[methodSign](...args);
      }
      return (this.store as any)[methodSign];
    });
  }

  protected set(props: Record<string, any>) {
    this.store.set(props);
  }

  protected singleSet(key: string, data: any) {
    this.store.set(key, data);
  }

  protected get<T>(...args: string[]): T {
    let value = this.store.get(args.join(".")) as string;

    try {
      value = JSON.parse(value);
    } finally {
      return value as any;
    }
  }

  protected get eventKey() {
    const baseKey = "electron-store";

    return this.name ? `${baseKey}-${this.name}` : baseKey;
  }
}
