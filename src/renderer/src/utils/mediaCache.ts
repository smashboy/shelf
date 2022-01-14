const cacheApi = self.caches;

export type CacheName = "covers" | "screenshots" | "artworks" | "icons";

export async function fetch(cacheName: CacheName, key: string) {
  try {
    const request = new Request(key.replace(/:/g, "_"));
    const cache = await cacheApi.open(cacheName);
    const response = await cache.match(request);
    if (!response) return null;

    const blob = await response.blob();

    const resolvedType = blob.type;

    return new Blob([blob], { type: resolvedType });
  } catch (err) {
    console.warn(err);
    return null;
  }
}

export async function save(cacheName: CacheName, key: string, data: Blob) {
  try {
    const cacheData = data;
    const request = new Request(key.replace(/:/g, "_"));
    const response = new Response(cacheData);
    const cache = await cacheApi.open(cacheName);
    return await cache.put(request, response);
  } catch (err) {
    console.warn(err);
  }
}

export async function clear(cacheName: CacheName) {
  try {
    if (!cacheApi) return undefined;

    return await cacheApi.delete(cacheName);
  } catch (err) {
    console.warn(err);
  }
}
