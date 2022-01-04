import path from "path";
import fs from "fs";
import crypto from "crypto";
import fsPromise from "fs/promises";
import { app, dialog } from "electron";
import BaseStore from "./BaseStore";
import type { CacheModel, CacheWithMediaModel } from "src/models/CacheModel";

export default class CacheStore extends BaseStore {
  private readonly memoryCache: Record<string, Record<string, CacheModel>> = {};

  constructor() {
    super({
      name: "cache",
    });

    this.createStore();
  }

  async save(
    bucket: string,
    key: string,
    data: Record<string, any>,
    media?: Record<string, string>
  ) {
    try {
      const model: CacheModel = { data, mediaPaths: {} };

      if (media && Object.keys(media).length > 0) {
        for (const key in media) {
          try {
            const item = media[key];
            const bucketPath = this.buildBucket(bucket);

            const mediaPath = `${bucketPath}${path.sep}${crypto.randomUUID()}.png`;

            model.mediaPaths[key] = mediaPath;

            await fsPromise.writeFile(
              mediaPath,
              item.replace(/^data:image\/png;base64,/, ""),
              "base64"
            );
          } catch (error) {
            console.error(error);
          }
        }
      }

      this._setMemoryCache(bucket, key, model);
      this.singleSet(`${bucket}.${key}`, model);
    } catch (error) {
      console.error(error);
    }
  }

  async update<T = any>(bucket: string, key: string, callback: (data: T) => T) {
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
      mediaPaths: cache.mediaPaths,
    };

    this._setMemoryCache(bucket, key, updatedCache);
    this.singleSet(`${bucket}.${key}`, updatedCache);
  }

  async load<T = any>(
    bucket: string,
    key: string,
    options?: { withoutMedia?: boolean }
  ): Promise<CacheWithMediaModel<T> | null> {
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

    const { mediaPaths, data } = cache;

    let media = {};

    if (!options?.withoutMedia) media = await this._loadMedia(mediaPaths);

    return { data, media };
  }

  async loadBucket(bucket: string) {
    let cache: Record<string, CacheModel> = {};

    const memoryCache = this.memoryCache[bucket] || null;
    let memoryCacheExist = false;

    if (memoryCache) {
      cache = memoryCache;
      memoryCacheExist = true;
    } else {
      cache = this.get<Record<string, CacheModel>>(bucket);
    }

    if (!cache) return null;

    if (!memoryCacheExist) this._setMemoryBucketCache(bucket, cache);

    const data: Record<string, CacheWithMediaModel> = {};

    for (const key in cache) {
      const item = cache[key];
      const media = await this._loadMedia(item.mediaPaths);

      data[key] = { data: item.data, media };
    }

    return data;
  }

  private async _loadMedia(paths: Record<string, string>) {
    let media: Record<string, string> = {};

    if (Object.keys(paths).length > 0) {
      for (const key in paths) {
        try {
          const path = paths[key];
          const downloaded = await fsPromise.readFile(path, { encoding: "base64" });
          media[key] = `data:image/png;base64,${downloaded}`;
        } catch (error) {
          continue;
        }
      }
    }

    return media;
  }

  private _setMemoryCache(bucket: string, key: string, data: CacheModel) {
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
