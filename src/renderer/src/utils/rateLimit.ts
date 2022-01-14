export default function rateLimit<T extends Function>(fn: T, delay: number) {
  const queue: any[] = [];

  let timer: number | null = null;

  async function processQueue() {
    const item = queue.shift();
    if (item) {
      try {
        await fn.apply(item.context, item.arguments);
      } catch (error) {
        console.warn(error);
      }
    }

    if (queue.length === 0) {
      clearInterval(timer as number);
      timer = null;
    }
  }

  // @ts-ignore
  return function limited(...args: Parameters<T>) {
    queue.push({
      // @ts-ignore
      context: this,
      arguments: [].slice.call(args),
    });
    if (!timer) {
      processQueue(); // start immediately on the first invocation
      // @ts-ignore
      timer = setInterval(processQueue, delay);
    }
  };
}
