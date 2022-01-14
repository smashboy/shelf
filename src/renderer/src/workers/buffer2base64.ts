onmessage = (event) => {
  const { buffer, type } = event.data as { buffer: Buffer; type: string };

  const reader = new FileReader();

  const blob = new Blob([buffer], { type });

  reader.readAsDataURL(blob);

  reader.onloadend = function () {
    const base64 = reader.result;
    postMessage({ base64, blob });
  };

  reader.onerror = (error) => {
    throw new Error("Process buffer web worker error");
  };
};
