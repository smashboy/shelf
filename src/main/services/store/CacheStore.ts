import path from "path";
import fs from "fs";

import { app, dialog } from "electron";
import BaseStore from "./BaseStore";
import type { CacheModel } from "src/models/CacheModel";

export default class CacheStore extends BaseStore {
  private readonly memoryCache: Record<string, Record<string, CacheModel>> = {};

  constructor() {
    super({
      name: "cache",
    });

    this.createStore();
  }

  async save(bucket: string, key: string | number, data: Record<string, any>) {
    const model: CacheModel = { data };

    this._setMemoryCache(bucket, key, model);
    this.singleSet(`${bucket}.${key}`, model);
  }

  async update<T = any>(bucket: string, key: string | number, callback: (data: T) => T) {
    let cache: CacheModel | null = null;

    const memoryCache = this.memoryCache[bucket]?.[key] || null;
    let memoryCacheExist = false;

    if (memoryCache) {
      cache = memoryCache;
      memoryCacheExist = true;
    } else {
      const storeKey = `${bucket}.${key}`;
      cache = this.get<CacheModel>(storeKey);
    }

    if (!cache) return;

    const updatedCache: CacheModel = {
      data: callback(cache.data),
    };

    this._setMemoryCache(bucket, key, updatedCache);
    this.singleSet(`${bucket}.${key}`, updatedCache);
  }

  async load<T = any>(bucket: string, key: string | number): Promise<CacheModel<T> | null> {
    let cache: CacheModel | null = null;

    const memoryCache = this.memoryCache[bucket]?.[key] || null;
    let memoryCacheExist = false;

    if (memoryCache) {
      cache = memoryCache;
      memoryCacheExist = true;
    } else {
      const storeKey = `${bucket}.${key}`;
      cache = this.get<CacheModel>(storeKey);
    }

    if (!cache) return null;

    if (!memoryCacheExist) this._setMemoryCache(bucket, key, cache);

    const { data } = cache;

    return { data };
  }

  async loadBucket<T>(bucket: string) {
    // let cache: Record<string, CacheModel> = {};

    // const memoryCache = this.memoryCache[bucket] || null;
    // let memoryCacheExist = false;

    // if (memoryCache) {
    //   cache = memoryCache;
    //   memoryCacheExist = true;
    // } else {
    //   cache = this.get<Record<string, CacheModel>>(bucket);
    // }

    // if (!cache) return null;

    // if (!memoryCacheExist) this._setMemoryBucketCache(bucket, cache);

    const cache = this.get<Record<string, CacheModel>>(bucket);

    const data: Record<string, CacheModel<T>> = {};

    for (const key in cache) {
      const item = cache[key];

      data[key] = { data: item.data };
    }

    return data;
  }

  private _setMemoryCache(bucket: string, key: string | number, data: CacheModel) {
    this.memoryCache[bucket] = this.memoryCache[bucket] || {};
    this.memoryCache[bucket][key] = data;
  }

  private _setMemoryBucketCache(bucket: string, data: Record<string, CacheModel>) {
    this.memoryCache[bucket] = data;
  }

  private createStore() {
    try {
      const storageDirectoryExists = fs.existsSync(this.rootPath);

      if (!storageDirectoryExists) fs.mkdirSync(this.rootPath);
    } catch (error) {
      dialog.showErrorBox("Create cache store error", JSON.stringify(error));
    }
  }

  private get rootPath() {
    return `${app.getPath("userData")}${path.sep}storage${path.sep}`;
  }

  private buildBucket(bucket: string) {
    const bucketFolder = `${this.rootPath}${bucket}`;

    const bucketFolderExists = fs.existsSync(bucketFolder);

    if (!bucketFolderExists) fs.mkdirSync(bucketFolder);

    return bucketFolder;
  }
}
