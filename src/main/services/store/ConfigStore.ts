import BaseStore from "./BaseStore";

export default class ConfigStore extends BaseStore {
  constructor() {
    super({
      initListeners: true,
    });
  }
}
