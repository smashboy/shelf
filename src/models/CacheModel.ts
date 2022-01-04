export interface CacheModel {
  data: any;
  mediaPaths: Record<string, string>;
}

export interface CacheWithMediaModel<T = any> {
  data: T;
  media: Record<string, string>;
}
