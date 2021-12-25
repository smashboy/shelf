import path from "path";
import fs from "fs";
import crypto from "crypto";
import fsPromise from "fs/promises";
import { app, dialog } from "electron";
import BaseStore from "./BaseStore";
import { CacheModel, CacheWithMediaModel } from "src/models/CacheModel";

export default class CacheStore extends BaseStore {
  private readonly memoryCache: Record<string, Record<string, CacheModel>> = {};

  constructor() {
    super({
      name: "cache",
    });

    this.createStore();
  }

  async save(bucket: string, key: string, data: Record<string, any>, media?: string) {
    try {
      const model: CacheModel = { data, mediaPaths: [] };

      if (media) {
        try {
          const bucketPath = this.buildBucket(bucket);

          const mediaPath = `${bucketPath}${path.sep}${crypto.randomUUID()}.webp`;

          model.mediaPaths.push(mediaPath);

          await fsPromise.writeFile(
            mediaPath,
            media.replace(/^data:image\/webp;base64,/, ""),
            "base64"
          );
        } catch (error) {
          console.error(error);
        }
      }

      this.setMemoryCache(bucket, key, model);
      this.singleSet(`${bucket}.${key}`, model);
    } catch (error) {
      console.error(error);
    }
  }

  async load(bucket: string, key: string): Promise<CacheWithMediaModel | null> {
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

    if (!memoryCacheExist) this.setMemoryCache(bucket, key, cache);

    const { mediaPaths, data } = cache;

    let media: string[] = [];

    if (mediaPaths.length > 0) {
      try {
        const promises = mediaPaths.map((item) => fsPromise.readFile(item, { encoding: "base64" }));

        media = (await Promise.all(promises)).map((item) => `data:image/webp;base64,${item}`);
      } catch (error) {
        console.error(error);
      }
    }

    return { data, media };
  }

  private setMemoryCache(bucket: string, key: string, data: CacheModel) {
    this.memoryCache[bucket] = this.memoryCache[bucket] || {};
    this.memoryCache[bucket][key] = data;
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
